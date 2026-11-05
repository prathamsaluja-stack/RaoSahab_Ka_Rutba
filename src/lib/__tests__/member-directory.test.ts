import { describe, expect, it } from 'vitest';
import { DIRECTORY_MEMBERS, findMember, searchMembers } from '@/lib/member-directory';

describe('the member directory', () => {
  it('marks every member fictional and gives every one a SYN- identifier', () => {
    for (const member of DIRECTORY_MEMBERS) {
      expect(member.isFictional).toBe(true);
      expect(member.id.startsWith('SYN-')).toBe(true);
    }
  });

  it('finds a member by identifier regardless of case', () => {
    expect(findMember('syn-hf-001')?.name).toBe('Harold Bellweather');
    expect(findMember('SYN-NOPE-999')).toBeUndefined();
  });

  it('searches name, identifier, plan and program', () => {
    expect(searchMembers('okonkwo').map((member) => member.id)).toEqual(['SYN-ED-003']);
    expect(searchMembers('SYN-DUAL').map((member) => member.id)).toEqual(['SYN-DUAL-005']);
    expect(searchMembers('medicaid').length).toBeGreaterThan(1);
  });

  it('returns the whole caseload for an empty query', () => {
    expect(searchMembers('   ')).toHaveLength(DIRECTORY_MEMBERS.length);
  });
});
