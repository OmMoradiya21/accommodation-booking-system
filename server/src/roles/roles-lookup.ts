export const ROLES_LOOKUP = Symbol('ROLES_LOOKUP');
export interface RolesLookup {
  findRoleIdByName(name: string): Promise<string>;
}
