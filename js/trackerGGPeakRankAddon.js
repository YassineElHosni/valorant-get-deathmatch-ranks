// https://api.tracker.gg/api/v2/valorant/standard/matches/riot/merlosan%23EUW?type=competitive&next=9

merlo.data.matches
  .flatMap((o) => o.segments[0].stats.rank.metadata)
  .sort(
    (a, b) =>
      +b.iconUrl.split("/tiers/")[1].split(".png")[0] -
      a.iconUrl.split("/tiers/")[1].split(".png")[0]
  );
