import { describe, expect, it } from 'vitest';
import { getBuddyReply } from '../ShilingiBuddy';

describe('Shilingi Buddy plan guidance', () => {
    it('uses only the approved Basic, Plus and Pro plan structure', () => {
        const reply = getBuddyReply('What is the Elite tier?');

        expect(reply).toContain('Basic');
        expect(reply).toContain('Plus');
        expect(reply).toContain('Pro');
        expect(reply).toContain('only three plans');
        expect(reply).not.toContain('Elite adds');
    });

    it('keeps deeper coaching within the documented tier', () => {
        expect(getBuddyReply('Help me repay debt', 'BASIC')).toContain('PLUS includes this deeper guidance');
        expect(getBuddyReply('Help me repay debt', 'PLUS')).toContain('Debt becomes easier');
        expect(getBuddyReply('Help me invest', 'PLUS')).toContain('PRO includes this deeper guidance');
        expect(getBuddyReply('Help me invest', 'PRO')).toContain('Investing starts');
    });
});
