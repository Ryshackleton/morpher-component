import worldTopo from './promises/worldTopology';
import usTopo from './promises/usTopologyAlbers';
// import worldHappinessByYear from './promises/worldHappinessByYear';
import policeShooting from './promises/policeShooting';

export default {
  policeShooting: policeShooting(),
  usTopology: usTopo(),
  // worldTopology: worldTopo(),
  // worldHappinessByYear: worldHappinessByYear(),
};
