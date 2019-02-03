import worldTopo from './promises/worldTopology';
import worldHappinessByYear from './promises/worldHappinessByYear';

export default {
  worldTopology: worldTopo(),
  worldHappinessByYear: worldHappinessByYear(),
};
