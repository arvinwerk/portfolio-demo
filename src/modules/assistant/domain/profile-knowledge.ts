export type ProfileFragment = {
  source: string;
  text: string;
};

export type ProfileSearch = {
  found: boolean;
  fragments: ProfileFragment[];
  note?: string;
};

export interface ProfileKnowledge {
  search(query: string): Promise<ProfileSearch>;
}
