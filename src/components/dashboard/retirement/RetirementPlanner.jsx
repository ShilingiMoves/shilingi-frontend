import React, { useEffect, useMemo, useState } from "react";
import NumericInput from "../../common/NumericInput";
import {
  ArrowRight,
  CalendarDays,
  FileText,
  Flame,
  Landmark,
  Loader2,
  PiggyBank,
  Plus,
  Sparkles,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";
import {
  createAsset,
  createAssetCategory,
  deleteAsset,
  getAssetCategories,
  getAssets,
} from "../../../services/investmentTrackerApi";
import { markDashboardDataExists } from "../../../utils/dashboardDataState";
import { usePlannerFinancialContext } from "../../../hooks/usePlannerFinancialContext";
import {
  buildFinancialSnapshot,
  buildRetirementInsights,
} from "../../../utils/financialIntelligence";
import { USER_PROFILE_WORKSPACE_KEY } from "../user/UserGoalsFamilyForm";

const RETIREMENT_CATEGORY_NAME = "Retirement Account";
const ACCOUNT_OPTIONS = [
  "NSSF - National Social Security Fund",
  "Sanlam Umbrella Pension",
  "Individual Pension Plan",
  "Employer Pension Scheme",
  "Retirement Savings Account",
];
const defaultAccountForm = {
  accountName: ACCOUNT_OPTIONS[0],
  provider: "",
  currentBalance: "",
  monthlyContribution: "",
  expectedReturn: "10",
  notes: "",
};
const defaultCalculator = {
  currentAge: "36",
  targetAge: "60",
  currentSavings: "178500",
  monthlyContribution: "18000",
  expectedReturn: "12",
  monthlyExpensesAtRetirement: "80000",
};
const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const formatKES = (value) =>
  `KES ${Math.round(toNumber(value)).toLocaleString("en-KE")}`;
const readProfileWorkspace = () => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(USER_PROFILE_WORKSPACE_KEY) || "{}");
  } catch {
    return {};
  }
};
const getCategoryIdentifier = (category) => {
  if (!category) return null;
  const candidates = [
    category.categoryId,
    category.id,
    category.uuid,
    category.raw?.id,
    category.raw?.pk,
    category.raw?.category_id,
    category.raw?.uuid,
  ];
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined || candidate === "")
      continue;
    const parsed = Number(candidate);
    if (Number.isFinite(parsed)) return parsed;
    if (typeof candidate === "string" && candidate.trim())
      return candidate.trim();
  }
  return null;
};
const monthlyFutureValue = ({
  currentSavings,
  monthlyContribution,
  expectedReturn,
  years,
}) => {
  const rate = toNumber(expectedReturn) / 100 / 12;
  const n = Math.max(Math.round(toNumber(years) * 12), 0);
  const principal = toNumber(currentSavings);
  const monthly = toNumber(monthlyContribution);
  if (n === 0) return principal;
  if (rate === 0) return principal + monthly * n;
  return principal * (1 + rate) ** n + monthly * (((1 + rate) ** n - 1) / rate);
};
const findRetirementCategoryId = (categories) => {
  const matched = categories.find((item) => {
    const name = normalize(item.name);
    return (
      name.includes("retirement") ||
      name.includes("pension") ||
      name.includes("nssf")
    );
  });
  return matched ? getCategoryIdentifier(matched) : null;
};
const getAccountMeta = (name) => {
  const value = normalize(name);
  if (value.includes("nssf"))
    return {
      label: "NSSF",
      badge: "Government",
      color: "#9dd5c0",
      icon: Landmark,
      returnRate: 6.5,
    };
  if (value.includes("sanlam"))
    return {
      label: "Sanlam Pension",
      badge: "Employer Scheme",
      color: "#179b6e",
      icon: WalletCards,
      returnRate: 13.2,
    };
  if (value.includes("individual"))
    return {
      label: "Personal Pension",
      badge: "Personal Plan",
      color: "#3b82f6",
      icon: PiggyBank,
      returnRate: 12.8,
    };
  if (value.includes("employer"))
    return {
      label: "Employer Pension",
      badge: "Employer Scheme",
      color: "#8b5cf6",
      icon: WalletCards,
      returnRate: 11.4,
    };
  return {
    label: "Retirement Account",
    badge: "Long-term",
    color: "#f59e0b",
    icon: PiggyBank,
    returnRate: 10.6,
  };
};

const RetirementPlanner = ({ onSelectSection }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showRebalanceModal, setShowRebalanceModal] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState("");
  const [accountForm, setAccountForm] = useState(defaultAccountForm);
  const [calculator, setCalculator] = useState(defaultCalculator);
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("objectives");
  const [profileWorkspace, setProfileWorkspace] = useState(() =>
    readProfileWorkspace(),
  );
  const plannerContext = usePlannerFinancialContext();

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [assetRows, categoryRows] = await Promise.all([
        getAssets(),
        getAssetCategories(),
      ]);
      setAssets(assetRows);
      setCategories(categoryRows);
    } catch (err) {
      setError(
        err.message || "Unable to load retirement planner data right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const syncProfile = () => setProfileWorkspace(readProfileWorkspace());
    window.addEventListener("storage", syncProfile);
    window.addEventListener("focus", syncProfile);
    return () => {
      window.removeEventListener("storage", syncProfile);
      window.removeEventListener("focus", syncProfile);
    };
  }, []);

  const retirementAssets = useMemo(
    () =>
      assets
        .filter((item) => {
          const category = normalize(item.categoryName);
          const name = normalize(item.name);
          return (
            category.includes("retirement") ||
            category.includes("pension") ||
            name.includes("pension") ||
            name.includes("nssf") ||
            name.includes("retirement")
          );
        })
        .map((asset) => ({
          ...asset,
          accountMeta: getAccountMeta(asset.name),
        })),
    [assets],
  );
  const totalRetirementBalance = useMemo(
    () =>
      retirementAssets.reduce(
        (sum, item) => sum + toNumber(item.currentValue),
        0,
      ),
    [retirementAssets],
  );
  const totalMonthlyContribution = useMemo(
    () =>
      retirementAssets.reduce(
        (sum, item) => sum + toNumber(item.purchaseValue),
        0,
      ),
    [retirementAssets],
  );
  const yearsRemaining = Math.max(
    toNumber(calculator.targetAge) - toNumber(calculator.currentAge),
    0,
  );
  const effectiveCurrentSavings =
    totalRetirementBalance > 0
      ? totalRetirementBalance
      : toNumber(calculator.currentSavings);
  const effectiveMonthlyContribution =
    totalMonthlyContribution > 0
      ? totalMonthlyContribution
      : toNumber(calculator.monthlyContribution);
  const projectedPot = monthlyFutureValue({
    currentSavings: effectiveCurrentSavings,
    monthlyContribution: effectiveMonthlyContribution,
    expectedReturn: calculator.expectedReturn,
    years: yearsRemaining,
  });
  const fireNumber = toNumber(calculator.monthlyExpensesAtRetirement) * 12 * 25;
  const fireProgress =
    fireNumber > 0 ? Math.min((projectedPot / fireNumber) * 100, 100) : 0;
  const readinessScore = Math.min(
    Math.round(
      fireProgress * 0.6 +
        Math.min((totalMonthlyContribution / 20000) * 22, 22) +
        Math.min((retirementAssets.length / 3) * 18, 18),
    ),
    100,
  );
  const earlyRetirementAge = Math.max(
    toNumber(calculator.currentAge) + Math.max(yearsRemaining - 6, 0),
    toNumber(calculator.currentAge),
  );
  const targetYear = new Date().getFullYear() + yearsRemaining;
  const contributionBreakdown = useMemo(
    () =>
      retirementAssets
        .map((asset) => ({
          label: asset.accountMeta.label,
          value: toNumber(asset.purchaseValue),
          color: asset.accountMeta.color,
        }))
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value),
    [retirementAssets],
  );
  const retirementSnapshot = useMemo(
    () =>
      buildFinancialSnapshot({
        profile: profileWorkspace,
        live: {
          income:
            profileWorkspace.monthly_income ||
            profileWorkspace.monthlyIncome ||
            profileWorkspace.netMonthlyIncome ||
            profileWorkspace.income,
          raw: {
            budgets: plannerContext.budgets,
            expenses: plannerContext.expenses,
            goals: plannerContext.goals,
            debts: plannerContext.debts,
            investments: assets,
          },
        },
      }),
    [
      assets,
      plannerContext.budgets,
      plannerContext.debts,
      plannerContext.expenses,
      plannerContext.goals,
      profileWorkspace,
    ],
  );
  const insightCards = useMemo(
    () =>
      buildRetirementInsights(retirementSnapshot, {
        projectedPot,
        fireNumber,
        targetYear,
        monthlyContribution: effectiveMonthlyContribution,
        earlyRetirementAge,
      }),
    [
      earlyRetirementAge,
      effectiveMonthlyContribution,
      fireNumber,
      projectedPot,
      retirementSnapshot,
      targetYear,
    ],
  );
  const returnsByVehicle = useMemo(() => {
    const rows = retirementAssets.map((asset) => ({
      label: asset.accountMeta.label,
      value: asset.accountMeta.returnRate,
      color: asset.accountMeta.color,
    }));
    if (!rows.some((item) => item.label.includes("Old Mutual")))
      rows.push({ label: "Old Mutual", value: 12.8, color: "#3b82f6" });
    if (!rows.some((item) => item.label.includes("CBK")))
      rows.push({ label: "CBK T-Bills", value: 16.2, color: "#f59e0b" });
    if (!rows.some((item) => item.label.includes("CIC")))
      rows.push({ label: "CIC Pension", value: 11.4, color: "#8b5cf6" });
    return rows.slice(0, 5);
  }, [retirementAssets]);
  const ecosystemCards = [
    {
      title: "Investment Planner",
      subtitle: "Portfolio powers retirement growth",
      action: "Open →",
      onClick: () => onSelectSection?.("investments"),
    },
    {
      title: "Net Worth",
      subtitle: "Pension funds included in assets",
      action: "View →",
      onClick: () => onSelectSection?.("networth"),
    },
    {
      title: "Protection Planner",
      subtitle: "Life cover funds retirement gap",
      action: "Plan →",
      onClick: () => onSelectSection?.("protection"),
    },
    {
      title: "Compare Hub",
      subtitle: "Find higher-return pension funds",
      action: "Compare →",
      onClick: () => onSelectSection?.("comparehub"),
    },
    {
      title: "Buddy AI",
      subtitle: "Personalised FIRE strategy advice",
      action: "Chat →",
      onClick: () => onSelectSection?.("buddy"),
    },
  ];

  const handleCalcChange = (key, value) =>
    setCalculator((current) => ({ ...current, [key]: value }));
  const handleFormChange = (key, value) =>
    setAccountForm((current) => ({ ...current, [key]: value }));
  const ensureCategoryId = async () => {
    let resolved = categories;
    let categoryId = findRetirementCategoryId(resolved);
    if (categoryId) return categoryId;
    try {
      await createAssetCategory({
        name: RETIREMENT_CATEGORY_NAME,
        color: "#179b6e",
        is_liquid: false,
      });
    } catch (err) {
      const message = String(err?.message || "").toLowerCase();
      if (
        !(
          message.includes("unique constraint") ||
          message.includes("already exists") ||
          message.includes("duplicate")
        )
      )
        throw err;
    }
    resolved = await getAssetCategories();
    setCategories(resolved);
    categoryId = findRetirementCategoryId(resolved);
    if (!categoryId)
      throw new Error("Could not resolve retirement category id.");
    return categoryId;
  };

  const addRetirementAccount = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const categoryId = await ensureCategoryId();
      await createAsset({
        name: accountForm.accountName,
        category: categoryId,
        current_value: String(toNumber(accountForm.currentBalance)),
        purchase_value: String(toNumber(accountForm.monthlyContribution)),
        currency: "KES",
        purchase_date: new Date().toISOString().split("T")[0],
        interest_rate: String(toNumber(accountForm.expectedReturn)),
        institution: accountForm.provider || "",
        account_number: "",
        is_liquid: false,
        include_in_net_worth: true,
        last_valued_date: new Date().toISOString().split("T")[0],
        notes: accountForm.notes || "",
      });
      markDashboardDataExists();
      setSuccess("Retirement account added and included in net worth.");
      setShowAddModal(false);
      setAccountForm(defaultAccountForm);
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to add retirement account.");
    } finally {
      setSaving(false);
    }
  };

  const removeRetirementAccount = async (asset) => {
    if (!asset?.uuid) return;
    if (!window.confirm(`Delete account "${asset.name}"?`)) return;
    try {
      setDeletingAccountId(asset.uuid);
      setError("");
      setSuccess("");
      await deleteAsset(asset.uuid);
      await loadData();
      setSuccess("Retirement account deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete retirement account.");
    } finally {
      setDeletingAccountId("");
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700">
          {success}
        </div>
      )}
      <section className="overflow-hidden rounded-[1.45rem] bg-[linear-gradient(135deg,_#18765e_0%,_#1b8a64_48%,_#38a96b_100%)] px-4 py-4 text-white shadow-sm sm:px-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-[39rem]">
            <p className="inline-flex items-center gap-3 dashboard-display-title text-[1.38rem] font-extrabold leading-none sm:text-[1.55rem]">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#18765e]">
                <PiggyBank size={16} />
              </span>
              Retirement Planner
            </p>
            <p className="mt-2 max-w-[31rem] text-[0.85rem] leading-5 text-white/80 sm:text-[0.9rem]">
              Plan your financial freedom. Calculate your FIRE number and build
              a retirement strategy.
            </p>
          </div>
          <div className="flex flex-col gap-2 xl:items-center xl:self-start">
            <div className="dashboard-toolbar-row xl:justify-center">
              <button
                type="button"
                onClick={() => setShowCompareModal(true)}
                className="inline-flex h-9 min-w-[154px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/22 bg-white/10 px-3.5 text-[0.84rem] font-semibold text-white backdrop-blur-sm"
              >
                <Sparkles size={14} />
                Compare Pensions
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex h-9 min-w-[182px] shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-3.5 text-[0.84rem] font-semibold text-[#18765e]"
              >
                + Add Retirement Account
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowRebalanceModal(true)}
              className="inline-flex h-9 min-w-[154px] self-center items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/22 bg-white/10 px-3.5 text-[0.84rem] font-semibold text-white backdrop-blur-sm"
            >
              <Sparkles size={14} />
              Rebalance Portfolio
            </button>
          </div>
        </div>
      </section>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Target Retirement Age"
          value={`Age ${calculator.targetAge}`}
          helper={`${yearsRemaining} yrs from now`}
          valueClass="text-[#175f54]"
        />
        <MetricCard
          title="Target Retirement Amount"
          value={formatKES(fireNumber)}
          helper="300x monthly retirement expenses"
          valueClass="text-[#175f54]"
        />
        <MetricCard
          title="Target Monthly Savings"
          value={formatKES(calculator.monthlyContribution)}
          helper="NSSF + pension + investments"
          valueClass="text-[#2167d8]"
        />
        <MetricCard
          title="Target Monthly Retirement Income"
          value={formatKES(calculator.monthlyExpensesAtRetirement)}
          helper="Planned monthly income need"
          valueClass="text-[#d28a0b]"
        />
      </section>
      <section className="rounded-[1.1rem] border border-primary-100 bg-white p-1 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <TabButton
            active={activeTab === "objectives"}
            onClick={() => setActiveTab("objectives")}
          >
            My Retirement Objectives
          </TabButton>
          <TabButton
            active={activeTab === "portfolio"}
            onClick={() => setActiveTab("portfolio")}
          >
            My Retirement Fund
          </TabButton>
          <TabButton
            active={activeTab === "solutions"}
            onClick={() => setActiveTab("solutions")}
          >
            Explore Retirement Solutions
          </TabButton>
          <TabButton
            active={activeTab === "simulator"}
            onClick={() => setActiveTab("simulator")}
          >
            Retirement Calculators
          </TabButton>
        </div>
      </section>
      {activeTab === "portfolio" && (
        <div className="space-y-4">
          <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
            <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <PanelHeading
                  icon={Landmark}
                  title="Retirement Accounts"
                  noMargin
                />
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="text-sm font-semibold text-[#175f54]"
                >
                  + Add Account
                </button>
              </div>
              <div className="mb-4 grid gap-3 rounded-[1rem] border border-emerald-100 bg-[#f8fcfa] p-4 sm:grid-cols-3">
                <MiniSummary
                  label="Accounts"
                  value={String(retirementAssets.length)}
                />
                <MiniSummary
                  label="Total Balance"
                  value={formatKES(totalRetirementBalance)}
                />
                <MiniSummary
                  label="Monthly"
                  value={formatKES(totalMonthlyContribution)}
                  valueClass="text-[#2167d8]"
                />
              </div>
              {loading ? (
                <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
                  <Loader2 size={16} className="animate-spin" />
                  Loading retirement accounts...
                </div>
              ) : retirementAssets.length === 0 ? (
                <EmptyState text="Add your first retirement account to start projections and tax planning." />
              ) : (
                <div className="space-y-4">
                  {retirementAssets.map((asset) => (
                    <RetirementAccountCard
                      key={asset.uuid}
                      asset={asset}
                      deleting={deletingAccountId === asset.uuid}
                      onDelete={() => removeRetirementAccount(asset)}
                      onTopUp={() => setShowAddModal(true)}
                    />
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="mt-4 flex w-full flex-col items-center justify-center rounded-[1rem] border border-dashed border-emerald-300 bg-[#f8fcfa] px-4 py-6 text-center"
              >
                <span className="text-2xl text-[#175f54]">+</span>
                <span className="mt-1 text-base font-semibold text-[#175f54]">
                  Link Another Retirement Account
                </span>
                <span className="mt-2 text-sm text-slate-500">
                  Add a personal pension, SACCO saving, or old mutual plan to
                  improve your projection accuracy.
                </span>
              </button>
            </article>
            <div className="space-y-4">
              <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                <PanelHeading
                  icon={Sparkles}
                  title="Shilingi Buddy Retirement Insights"
                />
                <div className="mt-4 space-y-3">
                  {insightCards.map((item) => (
                    <InsightCard
                      key={item.title}
                      title={item.title}
                      text={item.text}
                      tone={item.tone}
                    />
                  ))}
                </div>
              </article>
              <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                <PanelHeading icon={FileText} title="Tax Relief Tracker" />
                <div className="mt-4 space-y-3">
                  <TrackerRow
                    label="Current pension deduction"
                    value={`${formatKES(totalMonthlyContribution * 12)}/yr`}
                    helper={`${formatKES(totalMonthlyContribution)}/mo`}
                    tone="success"
                  />
                  <TrackerRow
                    label="Unclaimed tax relief"
                    value={
                      formatKES(
                        Math.max(240000 - totalMonthlyContribution * 12, 0),
                      ) + "/yr"
                    }
                    helper="Potential remaining deductible pension room"
                    tone="danger"
                  />
                  <button
                    type="button"
                    onClick={() => onSelectSection?.("comparehub")}
                    className="inline-flex w-full items-center justify-center rounded-[0.95rem] border border-emerald-200 bg-[#eef8f3] px-4 py-3 text-sm font-semibold text-[#175f54]"
                  >
                    Optimise Tax Relief ?
                  </button>
                </div>
              </article>
            </div>
          </section>
          <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
            <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
              <PanelHeading
                icon={WalletCards}
                title="Retirement Contribution Breakdown"
              />
              {contributionBreakdown.length > 0 ? (
                <>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#edf5f2]">
                    <div className="flex h-3 w-full">
                      {contributionBreakdown.map((item) => (
                        <div
                          key={item.label}
                          className="h-3 border-r border-white last:border-r-0"
                          style={{
                            width: `${
                              (item.value /
                                Math.max(
                                  contributionBreakdown.reduce(
                                    (sum, row) => sum + row.value,
                                    0,
                                  ),
                                  1,
                                )) *
                              100
                            }%`,
                            backgroundColor: item.color,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {contributionBreakdown.map((item) => (
                      <BreakdownRow
                        key={item.label}
                        item={item}
                        total={contributionBreakdown.reduce(
                          (sum, row) => sum + row.value,
                          0,
                        )}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState text="Add a retirement account with a monthly contribution to see this breakdown." />
              )}
              <div className="mt-4 border-t border-slate-200 pt-4 text-right text-[1.2rem] font-extrabold text-[#175f54]">
                Total Monthly Retirement Savings{" "}
                {formatKES(
                  contributionBreakdown.reduce(
                    (sum, row) => sum + row.value,
                    0,
                  ),
                )}
              </div>
            </article>
            <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
              <PanelHeading icon={FileText} title="Planner Number Sources" />
              <div className="mt-4 space-y-3">
                <MetricRow
                  label="Current fund value"
                  value={formatKES(effectiveCurrentSavings)}
                  tone="text-[#175f54]"
                />
                <MetricRow
                  label="Monthly savings used"
                  value={formatKES(effectiveMonthlyContribution)}
                  tone="text-[#2167d8]"
                />
                <MetricRow
                  label="Expected annual return"
                  value={`${toNumber(calculator.expectedReturn).toFixed(1)}%`}
                  tone="text-[#d28a0b]"
                />
                <InsightCard
                  title={
                    retirementAssets.length > 0
                      ? "Using your saved retirement accounts"
                      : "Using simulator inputs"
                  }
                  text={
                    retirementAssets.length > 0
                      ? "The projection is using the total balance and monthly contributions from the retirement accounts you added."
                      : "Add a retirement account to replace the sample simulator inputs with your saved fund data."
                  }
                  tone="border-emerald-200 bg-[#eef8f3] text-[#0d6648]"
                />
              </div>
            </article>
          </section>
          <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
            <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
              <PanelHeading icon={Sparkles} title="Analytics" />
              <div className="mt-4 flex items-center gap-4">
                <ScoreRing value={readinessScore} />
                <div>
                  <p className="dashboard-display-title text-[1.05rem] font-extrabold sm:text-[1.15rem] text-slate-950">
                    Retirement Readiness:{" "}
                    <span className="text-primary-700">
                      {readinessScore >= 85
                        ? "Very Good"
                        : readinessScore >= 65
                          ? "Good"
                          : "Improving"}
                    </span>
                  </p>
                  <p className="mt-2 text-[0.84rem] text-slate-600">
                    Your projected retirement pot of {formatKES(projectedPot)}{" "}
                    is tracking against a target of {formatKES(fireNumber)}.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <TagChip label="Emergency Fund set" tone="success" />
                <TagChip label="NSSF enrolled" tone="success" />
                <TagChip label="Pension plan funded" tone="warning" />
                <TagChip label={`FIRE by ${targetYear - 6}`} tone="muted" />
              </div>
            </article>
            <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
              <PanelHeading icon={PiggyBank} title="Objective Progress" />
              <div className="mt-4 space-y-3">
                <MetricRow
                  label="Target age"
                  value={`Age ${calculator.targetAge}`}
                  tone="text-[#175f54]"
                />
                <MetricRow
                  label="Projected retirement year"
                  value={String(targetYear)}
                  tone="text-[#2167d8]"
                />
                <MetricRow
                  label="Gap to target"
                  value={formatKES(Math.max(fireNumber - projectedPot, 0))}
                  tone={
                    projectedPot >= fireNumber
                      ? "text-[#175f54]"
                      : "text-rose-500"
                  }
                />
                <button
                  type="button"
                  onClick={() => setActiveTab("simulator")}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] bg-[#1c6c5d] px-4 py-3 text-sm font-semibold text-white"
                >
                  Simulate This
                  <Sparkles size={13} />
                </button>
              </div>
            </article>
          </section>
          <section className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <PanelHeading
                icon={FileText}
                title="Retirement Account Summary"
                noMargin
              />
              <button
                type="button"
                className="text-sm font-semibold text-[#175f54]"
              >
                Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-emerald-100 text-left text-[11px] uppercase tracking-[0.16em] text-[#9bb8af]">
                    <th className="py-3 pr-4 font-semibold">Account</th>
                    <th className="py-3 pr-4 font-semibold">Type</th>
                    <th className="py-3 pr-4 font-semibold">Balance</th>
                    <th className="py-3 pr-4 font-semibold">
                      Monthly Contribution
                    </th>
                    <th className="py-3 pr-4 font-semibold">Return P.A.</th>
                    <th className="py-3 pr-4 font-semibold">Vesting</th>
                    <th className="py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {retirementAssets.length > 0 ? (
                    retirementAssets.map((asset) => (
                      <tr
                        key={asset.uuid}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <td className="py-3 pr-4 font-medium text-slate-900">
                          {asset.name}
                        </td>
                        <td className="py-3 pr-4 text-slate-700">
                          {asset.accountMeta.badge}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-[#175f54]">
                          {formatKES(asset.currentValue)}
                        </td>
                        <td className="py-3 pr-4 text-[#2167d8]">
                          {formatKES(asset.purchaseValue)}
                        </td>
                        <td className="py-3 pr-4 text-slate-700">
                          {asset.accountMeta.returnRate}%
                        </td>
                        <td className="py-3 pr-4 text-slate-700">
                          {asset.accountMeta.label === "NSSF"
                            ? "Fully vested"
                            : "50% - 4 yrs"}
                        </td>
                        <td className="py-3">
                          <span className="inline-flex rounded-full bg-[#eef8f3] px-2.5 py-1 text-xs font-semibold text-[#175f54]">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-sm text-slate-500"
                      >
                        Add retirement accounts to populate this summary.
                      </td>
                    </tr>
                  )}
                  <tr className="bg-[#f8fcfa]">
                    <td className="py-4 pr-4 font-extrabold text-slate-950">
                      TOTAL
                    </td>
                    <td className="py-4 pr-4" />
                    <td className="py-4 pr-4 font-extrabold text-[#175f54]">
                      {formatKES(totalRetirementBalance)}
                    </td>
                    <td className="py-4 pr-4 font-extrabold text-[#2167d8]">
                      {formatKES(totalMonthlyContribution)}
                    </td>
                    <td className="py-4 pr-4 font-extrabold text-[#175f54]">
                      {retirementAssets.length
                        ? `${(retirementAssets.reduce((sum, asset) => sum + asset.accountMeta.returnRate, 0) / retirementAssets.length).toFixed(1)}%`
                        : "0.0%"}
                    </td>
                    <td className="py-4 pr-4" />
                    <td className="py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="rounded-[0.8rem] border border-emerald-200 bg-[#eef8f3] px-3 py-1.5 text-sm font-semibold text-[#175f54]"
                      >
                        + Add
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <section className="overflow-hidden rounded-[1.45rem] bg-gradient-to-r from-[#165747] via-[#1f6d5d] to-[#2f7f6a] p-5 text-white shadow-sm">
            <p className="dashboard-display-title text-[1.28rem] font-extrabold sm:text-[1.4rem]">
              Your Retirement is Connected to the Full Ecosystem
            </p>
            <p className="mt-2 text-sm text-white/80">
              Retirement savings link automatically to your net worth,
              protection planning, investments, and Buddy AI advice.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {ecosystemCards.map((card) => (
                <button
                  key={card.title}
                  type="button"
                  onClick={card.onClick}
                  className="rounded-[1rem] border border-white/15 bg-white/5 p-4 text-left transition hover:bg-white/10"
                >
                  <p className="font-semibold">{card.title}</p>
                  <p className="mt-2 text-sm text-white/70">{card.subtitle}</p>
                  <p className="mt-3 text-sm font-semibold text-[#f4c95d]">
                    {card.action}
                  </p>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
      {activeTab === "objectives" && (
        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
            <PanelHeading icon={PiggyBank} title="My Retirement Objectives" />
            <div className="mt-4 space-y-3">
              <MetricRow
                label="Target retirement age"
                value={`Age ${calculator.targetAge}`}
                tone="text-[#175f54]"
              />
              <MetricRow
                label="Target retirement amount"
                value={formatKES(fireNumber)}
                tone="text-[#2167d8]"
              />
              <MetricRow
                label="Target monthly savings"
                value={formatKES(calculator.monthlyContribution)}
                tone="text-[#175f54]"
              />
              <MetricRow
                label="Target monthly retirement income"
                value={formatKES(calculator.monthlyExpensesAtRetirement)}
                tone="text-[#d28a0b]"
              />
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("simulator")}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] bg-[#1c6c5d] px-4 py-3 text-sm font-semibold text-white"
            >
              Adjust Simulator
              <Sparkles size={13} />
            </button>
          </article>
          <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
            <PanelHeading icon={Sparkles} title="Advisor Notes" />
            <div className="mt-4 space-y-3">
              <InsightCard
                title="Contribution target"
                text={`Keep monthly savings at ${formatKES(calculator.monthlyContribution)} or above to stay near the ${targetYear} target.`}
                tone="border-emerald-200 bg-[#eef8f3] text-[#0d6648]"
              />
              <InsightCard
                title="Income goal"
                text={`Your target monthly retirement income is ${formatKES(calculator.monthlyExpensesAtRetirement)}. Review it annually for inflation and health-care costs.`}
                tone="border-amber-200 bg-amber-50 text-amber-800"
              />
              <InsightCard
                title="Portfolio gap"
                text={
                  projectedPot >= fireNumber
                    ? "Projected pot currently meets the target. Focus on fees, preservation, and a sensible drawdown plan."
                    : `Current projection is short by ${formatKES(fireNumber - projectedPot)}. Consider increasing contributions, extending the timeline, or improving net returns.`
                }
                tone={
                  projectedPot >= fireNumber
                    ? "border-emerald-200 bg-[#eef8f3] text-[#0d6648]"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }
              />
            </div>
          </article>
        </section>
      )}
      {activeTab === "solutions" && (
        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
            <PanelHeading icon={Sparkles} title="Explore Retirement Solutions" />
            <div className="mt-4 grid gap-3">
              {retirementAssets.length === 0 ? (
                <p className="rounded-[1rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                  Add a retirement account first so Shilingi can suggest
                  pension reviews, tax relief opportunities, and contribution
                  improvements based on your actual fund.
                </p>
              ) : (
                retirementAssets.slice(0, 3).map((asset) => (
                  <div
                    key={`${asset.uuid}-solution`}
                    className="rounded-[1rem] border border-slate-200 bg-[#f7fbf9] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {asset.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {asset.accountMeta.badge} - Current balance{" "}
                          {formatKES(asset.currentValue)}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {toNumber(asset.purchaseValue) >= 20000
                          ? "Tax room near target"
                          : "Tax relief opportunity"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-700">
                      {toNumber(asset.purchaseValue) >= 20000
                        ? "Review fees, fund performance, and beneficiary details before increasing contributions."
                        : "Compare pension products and consider raising monthly contributions toward the deductible pension room."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("simulator")}
                        className="rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-700"
                      >
                        Simulate growth
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCompareModal(true)}
                        className="rounded-full border border-emerald-200 bg-[#eef8f3] px-4 py-2 text-xs font-semibold text-[#175f54]"
                      >
                        Compare pensions
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
            <PanelHeading icon={PiggyBank} title="What to Compare" />
            <div className="mt-4 space-y-3">
              <ChecklistRow text="Annual fund return after fees and charges" />
              <ChecklistRow text="Monthly contribution flexibility and top-up rules" />
              <ChecklistRow text="Tax relief eligibility and employer matching" />
              <ChecklistRow text="Vesting period, access rules, and portability" />
              <ChecklistRow text="Beneficiary nomination and claim process" />
            </div>
            <div className="mt-5 rounded-[1rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Compare pensions using net return, fees, tax relief, and access
              rules together. The highest advertised return is not always the
              best retirement fit.
            </div>
          </article>
        </section>
      )}
      {activeTab === "simulator" && (
        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
            <PanelHeading icon={Sparkles} title="Retirement Calculators" />
            <p className="mt-3 text-sm text-slate-600">
              Test how earlier contributions, stronger returns, and lower target
              expenses can shift your retirement timeline.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField
                label="Current Age"
                value={calculator.currentAge}
                onChange={(value) => handleCalcChange("currentAge", value)}
              />
              <TextField
                label="Target Age"
                value={calculator.targetAge}
                onChange={(value) => handleCalcChange("targetAge", value)}
              />
              <TextField
                label="Current Savings (KES)"
                value={calculator.currentSavings}
                onChange={(value) => handleCalcChange("currentSavings", value)}
              />
              <TextField
                label="Monthly Contribution (KES)"
                value={calculator.monthlyContribution}
                onChange={(value) =>
                  handleCalcChange("monthlyContribution", value)
                }
              />
              <TextField
                label="Expected Return (%)"
                value={calculator.expectedReturn}
                onChange={(value) => handleCalcChange("expectedReturn", value)}
              />
              <TextField
                label="Monthly Expenses at Retirement"
                value={calculator.monthlyExpensesAtRetirement}
                onChange={(value) =>
                  handleCalcChange("monthlyExpensesAtRetirement", value)
                }
              />
            </div>
            <div className="mt-5 rounded-[1rem] border border-amber-200 bg-[linear-gradient(180deg,_#f7fbf8_0%,_#fff4df_100%)] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#9bb8af]">
                Projected Retirement Pot
              </p>
              <p className="mt-2 text-[2.6rem] font-extrabold leading-none text-[#175f54]">
                {formatKES(projectedPot)}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                FIRE progress: {Math.round(fireProgress)}%
              </p>
            </div>
          </article>
          <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
            <PanelHeading icon={PiggyBank} title="Scenario Summary" />
            <div className="mt-4 space-y-3">
              <MetricRow
                label="FIRE Number"
                value={formatKES(fireNumber)}
                tone="text-[#d28a0b]"
              />
              <MetricRow
                label="Projected Pot"
                value={formatKES(projectedPot)}
                tone="text-[#175f54]"
              />
              <MetricRow
                label="Retirement Year"
                value={String(targetYear)}
                tone="text-[#2167d8]"
              />
              <MetricRow
                label="Years Remaining"
                value={`${yearsRemaining} yrs`}
                tone="text-[#8b5cf6]"
              />
              <button
                type="button"
                onClick={() => setShowRebalanceModal(true)}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] bg-[#1c6c5d] px-4 py-3 text-sm font-semibold text-white"
              >
                Rebalance Portfolio
                <ArrowRight size={14} />
              </button>
            </div>
          </article>
        </section>
      )}
      {showAddModal && (
        <AddRetirementModal
          form={accountForm}
          saving={saving}
          onClose={() => setShowAddModal(false)}
          onChange={handleFormChange}
          onSubmit={addRetirementAccount}
        />
      )}
      {showCompareModal && (
        <ComparePensionsModal
          onClose={() => setShowCompareModal(false)}
          onOpenHub={() => {
            setShowCompareModal(false);
            onSelectSection?.("comparehub");
          }}
        />
      )}
      {showRebalanceModal && (
        <RetirementRebalanceModal
          onClose={() => setShowRebalanceModal(false)}
        />
      )}
    </div>
  );
};

const HeroStat = ({ icon: Icon, label, sublabel }) => (
  <div className="flex items-center gap-2 border-r border-white/18 pr-4 last:border-r-0">
    <Icon size={16} className="text-[#f59e0b]" />
    <div>
      <p className="dashboard-metric-value dashboard-display-title text-[1.1rem] font-extrabold leading-none text-[#f4c95d] sm:text-[1.25rem]">
        {label}
      </p>
      <p className="text-[0.78rem] text-white/72 sm:text-[0.82rem]">
        {sublabel}
      </p>
    </div>
  </div>
);
const HeroMini = ({ value, label }) => (
  <div>
    <p className="dashboard-metric-value dashboard-display-title text-[1.1rem] font-extrabold leading-none text-[#f4c95d] sm:text-[1.25rem]">
      {value}
    </p>
    <p className="mt-1 text-[0.78rem] text-white/72 sm:text-[0.82rem]">
      {label}
    </p>
  </div>
);
const MetricCard = ({
  title,
  value,
  helper,
  valueClass,
  featured = false,
  progress = 0,
}) => (
  <article className="rounded-[1.15rem] border border-primary-100 bg-white px-4 py-3.5 shadow-sm">
    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9bb8af]">
      {title}
    </p>
    <p
      className={`mt-2 dashboard-metric-value text-[1.18rem] font-extrabold leading-[1.05] sm:text-[1.34rem] ${featured ? "text-[#175f54]" : valueClass}`}
    >
      {value}
    </p>
    <p className="mt-2 text-[0.78rem] leading-5 text-slate-500">{helper}</p>
    {featured ? (
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e7f3ee]">
        <div
          className="h-full rounded-full bg-[#f4c95d]"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    ) : null}
  </article>
);
const ScoreRing = ({ value }) => (
  <div className="relative flex h-20 w-20 items-center justify-center">
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background: `conic-gradient(#179b6e ${value * 3.6}deg, #e8f3ef 0deg)`,
      }}
    />
    <div className="absolute inset-[7px] rounded-full bg-white" />
    <div className="relative text-center">
      <p className="text-[1.3rem] font-extrabold leading-none text-primary-700">
        {value}
      </p>
      <p className="text-[11px] text-slate-500">/100</p>
    </div>
  </div>
);
const TagChip = ({ label, tone }) => (
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone === "success" ? "bg-primary-50 text-primary-700" : tone === "warning" ? "bg-amber-50 text-amber-700" : "bg-[#f4f7f6] text-slate-400"}`}
  >
    {label}
  </span>
);
const TabButton = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-[0.9rem] px-4 py-2.5 text-sm font-semibold transition-colors ${active ? "bg-primary-700 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
  >
    {children}
  </button>
);
const PanelHeading = ({ icon: Icon, title, noMargin = false }) => (
  <div className={`flex items-center gap-3 ${noMargin ? "" : "mb-1"}`}>
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
      <Icon size={18} />
    </span>
    <h3 className="dashboard-display-title text-[1.05rem] font-bold text-slate-950">
      {title}
    </h3>
  </div>
);
const MiniSummary = ({ label, value, valueClass = "text-primary-700" }) => (
  <div className="rounded-[0.95rem] border border-primary-100 bg-white px-4 py-3 text-center">
    <p className="text-xs uppercase tracking-[0.16em] text-[#9bb8af]">
      {label}
    </p>
    <p
      className={`mt-2 text-[1.8rem] font-extrabold leading-none ${valueClass}`}
    >
      {value}
    </p>
  </div>
);
const InsightCard = ({ title, text, tone }) => (
  <div className={`rounded-[1rem] border p-4 text-sm ${tone}`}>
    <p className="font-semibold">{title}</p>
    <p className="mt-1">{text}</p>
  </div>
);
const ReturnBar = ({ item }) => (
  <div>
    <div className="mb-1 flex items-center justify-between text-sm">
      <span className="text-slate-700">{item.label}</span>
      <span className="font-semibold" style={{ color: item.color }}>
        {item.value}%
      </span>
    </div>
    <div className="h-2.5 rounded-full bg-[#edf5f2]">
      <div
        className="h-2.5 rounded-full"
        style={{
          width: `${Math.min(item.value * 5.5, 100)}%`,
          backgroundColor: item.color,
        }}
      />
    </div>
  </div>
);
const TrackerRow = ({ label, value, helper, tone }) => (
  <div
    className={`rounded-[1rem] border px-4 py-3 ${tone === "success" ? "border-primary-100 bg-primary-50" : "border-rose-100 bg-rose-50"}`}
  >
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="text-sm text-slate-500">{helper}</p>
      </div>
      <p
        className={`text-[1.2rem] font-extrabold ${tone === "success" ? "text-primary-700" : "text-rose-500"}`}
      >
        {value}
      </p>
    </div>
  </div>
);
const BreakdownRow = ({ item, total }) => (
  <div>
    <div className="mb-1 flex items-center justify-between text-sm">
      <span className="text-slate-700">{item.label}</span>
      <span className="font-semibold" style={{ color: item.color }}>
        {formatKES(item.value)}
      </span>
    </div>
    <div className="h-2.5 rounded-full bg-[#edf5f2]">
      <div
        className="h-2.5 rounded-full"
        style={{
          width: `${(item.value / Math.max(total, 1)) * 100}%`,
          backgroundColor: item.color,
        }}
      />
    </div>
  </div>
);
const TimelineRow = ({ item, active }) => (
  <div className="relative pl-8">
    <span
      className={`absolute left-0 top-1 inline-flex h-4 w-4 rounded-full border-4 ${active ? "border-amber-400 bg-white" : "border-emerald-200 bg-white"}`}
    />
    <div>
      <p className="text-sm text-[#9bb8af]">{item.year}</p>
      <p className={`text-[1.1rem] font-bold ${item.tone}`}>{item.label}</p>
      <p className="text-sm text-slate-500">{item.detail}</p>
      {item.amount ? (
        <p className="mt-1 font-semibold text-[#175f54]">{item.amount}</p>
      ) : null}
    </div>
  </div>
);
const SolutionCard = ({ title, value, onCompare }) => (
  <article className="rounded-[1.2rem] border border-primary-100 bg-white p-5 shadow-sm">
    <p className="text-lg font-bold text-slate-950">{title}</p>
    <p className="mt-4 dashboard-metric-value text-[1.7rem] font-extrabold text-primary-700">
      {value}
    </p>
    <button
      type="button"
      onClick={onCompare}
      className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700"
    >
      Open Compare Hub
      <ArrowRight size={14} />
    </button>
  </article>
);
const MetricRow = ({ label, value, tone }) => (
  <div className="rounded-[1rem] border border-slate-100 bg-[#f7fbf9] px-4 py-3">
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-700">{label}</span>
      <span className={`text-xl font-extrabold ${tone}`}>{value}</span>
    </div>
  </div>
);
const ChecklistRow = ({ text }) => (
  <div className="flex items-start gap-3 rounded-[0.9rem] border border-slate-100 bg-[#f7fbf9] px-4 py-3 text-sm text-slate-700">
    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dff3ea] text-[10px] font-extrabold text-[#175f54]">
      OK
    </span>
    <span>{text}</span>
  </div>
);
const EmptyState = ({ text }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">
    {text}
  </div>
);
const InfoCell = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9bb8af]">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);
const TextField = ({ label, value, onChange }) => (
  <label className="block text-sm font-medium text-slate-700">
    {label}
    <NumericInput
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
    />
  </label>
);
const Field = ({ label, value, onChange, ...props }) => (
  <label className="block text-sm font-medium text-slate-700">
    {label}
    {props.type === 'number' ? (
      <NumericInput
        {...props}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
      />
    ) : (
      <input
        {...props}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
      />
    )}
  </label>
);
const RetirementAccountCard = ({ asset, deleting, onDelete, onTopUp }) => {
  const Icon = asset.accountMeta.icon;
  const contribution = toNumber(asset.purchaseValue);
  const progress = Math.min((contribution / Math.max(18000, 1)) * 100, 100);
  return (
    <article className="rounded-[1.1rem] border border-emerald-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `${asset.accountMeta.color}14`,
              color: asset.accountMeta.color,
            }}
          >
            <Icon size={20} />
          </span>
          <div>
            <p className="text-[1.1rem] font-bold text-slate-900">
              {asset.name}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {asset.institution || asset.accountMeta.badge}
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="dashboard-metric-value text-[1.7rem] font-extrabold leading-none sm:text-[1.9rem] text-slate-900">
            {formatKES(asset.currentValue)}
          </p>
          <p className="mt-1 text-sm font-semibold text-[#175f54]">
            {asset.accountMeta.returnRate}% p.a.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <InfoCell
          label="Monthly contribution"
          value={formatKES(asset.purchaseValue)}
        />
        <InfoCell label="Years contributing" value="4 Years" />
        <InfoCell
          label="Vesting"
          value={
            asset.accountMeta.label === "NSSF" ? "Fully vested" : "50% - 4 yrs"
          }
        />
        <InfoCell label="Account type" value={asset.accountMeta.badge} />
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Progress toward FIRE target contribution
          </span>
          <span className="font-semibold text-[#175f54]">
            {progress.toFixed(1)}%
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-[#edf5f2]">
          <div
            className="h-2.5 rounded-full"
            style={{
              width: `${Math.max(progress, 8)}%`,
              backgroundColor: asset.accountMeta.color,
            }}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onTopUp}
          className="rounded-[0.9rem] border border-emerald-200 bg-[#eef8f3] px-4 py-2 text-sm font-semibold text-[#175f54]"
        >
          + Top Up
        </button>
        <button
          type="button"
          className="rounded-[0.9rem] border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700"
        >
          Link Account
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="rounded-[0.9rem] border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 disabled:opacity-60"
        >
          {deleting ? "Removing..." : "Delete"}
        </button>
      </div>
    </article>
  );
};
const AddRetirementModal = ({ form, saving, onClose, onChange, onSubmit }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
    <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-bold text-slate-900">
          Add Retirement Account
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        >
          <X size={18} />
        </button>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 px-5 py-5">
        <label className="block text-sm font-medium text-slate-700">
          Account type
          <select
            value={form.accountName}
            onChange={(event) => onChange("accountName", event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            {ACCOUNT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <Field
          label="Provider / Institution"
          value={form.provider}
          onChange={(value) => onChange("provider", value)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Current balance (KES)"
            type="number"
            value={form.currentBalance}
            onChange={(value) => onChange("currentBalance", value)}
          />
          <Field
            label="Monthly contribution (KES)"
            type="number"
            value={form.monthlyContribution}
            onChange={(value) => onChange("monthlyContribution", value)}
          />
        </div>
        <Field
          label="Expected return (% p.a.)"
          type="number"
          value={form.expectedReturn}
          onChange={(value) => onChange("expectedReturn", value)}
        />
        <label className="block text-sm font-medium text-slate-700">
          Notes (optional)
          <textarea
            value={form.notes}
            onChange={(event) => onChange("notes", event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
        </label>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="submit"
            disabled={
              saving || !form.currentBalance || !form.monthlyContribution
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}Save
            Account
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
);
const ComparePensionsModal = ({ onClose, onOpenHub }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
    <div className="w-full max-w-[560px] rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.16)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 dashboard-display-title text-[1.28rem] font-extrabold sm:text-[1.4rem] text-slate-950">
            <Sparkles size={18} className="text-[#0f5d50]" />
            Compare Pension Options
          </p>
          <p className="mt-3 text-sm text-slate-600">
            These retirement products stand out based on return potential, tax
            efficiency, and flexibility.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-[#f8fcfa] text-slate-500"
        >
          <X size={16} />
        </button>
      </div>
      <div className="mt-5 overflow-hidden rounded-[1rem] border border-emerald-100">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f8fcfa] text-left text-[11px] uppercase tracking-[0.16em] text-[#9bb8af]">
            <tr>
              <th className="px-4 py-3 font-semibold">Fund</th>
              <th className="px-4 py-3 font-semibold">Return</th>
              <th className="px-4 py-3 font-semibold">Why it fits</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                name: "Sanlam Pension",
                rate: "13.2%",
                fit: "Strong long-term growth",
              },
              {
                name: "Old Mutual Pension",
                rate: "12.8%",
                fit: "Balanced with strong manager",
              },
              {
                name: "CBK T-Bills",
                rate: "16.2%",
                fit: "Great for short-term surplus cash",
              },
            ].map((row, index) => (
              <tr
                key={row.name}
                className={`border-t border-emerald-100 ${index === 0 ? "bg-[#fff8ea]" : "bg-white"}`}
              >
                <td className="px-4 py-3 font-semibold text-slate-900">
                  {row.name}
                </td>
                <td className="px-4 py-3 text-[#175f54]">{row.rate}</td>
                <td className="px-4 py-3 text-slate-700">{row.fit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-12 items-center justify-center rounded-[0.95rem] border border-emerald-100 bg-[#f8fcfa] px-5 text-sm font-semibold text-slate-700 sm:w-[110px]"
        >
          Close
        </button>
        <button
          type="button"
          onClick={onOpenHub}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-[0.95rem] bg-[#1c6c5d] px-5 text-sm font-semibold text-white"
        >
          Open Full Hub →
        </button>
      </div>
    </div>
  </div>
);
const RetirementRebalanceModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
    <div className="w-full max-w-[520px] rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.16)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 dashboard-display-title text-[1.28rem] font-extrabold sm:text-[1.4rem] text-slate-950">
            <Sparkles size={18} className="text-[#0f5d50]" />
            Retirement Rebalancing
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Your retirement portfolio can likely carry more growth assets today,
            then derisk later as your target date gets closer.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-[#f8fcfa] text-slate-500"
        >
          <X size={16} />
        </button>
      </div>
      <div className="mt-5 space-y-3">
        {[
          { label: "Growth assets", current: "48%", target: "60%" },
          { label: "Income assets", current: "38%", target: "28%" },
          { label: "Liquidity buffer", current: "14%", target: "12%" },
        ].map((row) => (
          <div
            key={row.label}
            className="rounded-[1rem] border border-emerald-100 bg-[#f8fcfa] px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-900">{row.label}</span>
              <span className="text-sm text-slate-500">
                Current {row.current} → Target {row.target}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-12 items-center justify-center rounded-[0.95rem] border border-emerald-100 bg-[#f8fcfa] px-5 text-sm font-semibold text-slate-700 sm:w-[110px]"
        >
          Close
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-[0.95rem] bg-[#1c6c5d] px-5 text-sm font-semibold text-white"
        >
          Save Rebalance Plan
        </button>
      </div>
    </div>
  </div>
);
export default RetirementPlanner;
