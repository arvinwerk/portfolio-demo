export type ProfileFragment = {
  source: string;
  text: string;
};

export type ProfileSearch = {
  found: boolean;
  fragments: ProfileFragment[];
  note?: string;
};

export type ProfileRetriever = {
  search(query: string): Promise<ProfileSearch>;
};
