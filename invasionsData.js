var worldStateData = require("warframe-worldstate-data");
//var missionData = worldStateData.missionTypes;
//var factionData = worldStateData.factions;
var rewardsData = worldStateData.languages;
var nodeData = worldStateData.solNodes;

function getInvasionData(callback, status) {
  var body = require("./wfWorldStateData.js");
  body(
    function(rawData) {
      callback(rawData);
    },
    setDataType,
    outputFormat,
    status
  );
}

function setDataType(rawData) {
  var dataOfInterest = [
    rawData.Invasions,
    ["Node", "AttackerReward", "DefenderReward"]
  ];
  return dataOfInterest;
}

function outputFormat(dataMap) {
  var embedObject = dataMap[0].map(function(dir) {
    var node = nodeData[dir.Node]["value"];
    if (
      dir.AttackerReward.countedItems != undefined &&
      dir.DefenderReward.countedItems != undefined
    ) {
      var attReward = dir.AttackerReward.countedItems[0];
      var defReward = dir.DefenderReward.countedItems[0];
      var attRewardNumber = attReward.ItemCount > 1
        ? `(${attReward.ItemCount})`
        : "";
      var defRewardNumber = defReward.ItemCount > 1
        ? `(${defReward.ItemCount})`
        : "";
      return {
        name: `${rewardsData[attReward.ItemType.toLowerCase()][
          "value"
        ]} ${attRewardNumber} vs. ${rewardsData[
          defReward.ItemType.toLowerCase()
        ]["value"]} ${defRewardNumber}`,
        value: `${node}`
      };
    } else if (
      dir.AttackerReward.items != undefined &&
      dir.DefenderReward.items != undefined
    ) {
      var attReward = dir.AttackerReward.items[0];
      var defReward = dir.DefenderReward.items[0];
      var attRewardType = rewardsData[attReward.ItemType.toLowerCase()][
        "value"
      ] === "Mutalist Alad V Nav Coordinate"
        ? `Alad V Nav Coordinate`
        : rewardsData[attReward.ItemType.toLowerCase()]["value"];
      var defRewardType = rewardsData[defReward.ItemType.toLowerCase()][
        "value"
      ] === "Mutalist Alad V Nav Coordinate"
        ? `Alad V Nav Coordinate`
        : rewardsData[defReward.ItemType.toLowerCase()]["value"];
      return {
        name: `${attRewardType} vs. ${defRewardType}`,
        value: `${node}`
      };
    } else if (
      dir.AttackerReward.countedItems === undefined &&
      dir.DefenderReward.countedItems != undefined
    ) {
      var reward = dir.DefenderReward.countedItems[0];
      var rewardNumber = reward.ItemCount > 1 ? `(${reward.ItemCount})` : "";
      var rewardType = rewardsData[reward.ItemType.toLowerCase()]["value"] ===
        "Mutalist Alad V Nav Coordinate"
        ? `Alad V Nav Coordinate`
        : rewardsData[reward.ItemType.toLowerCase()]["value"];
      return {
        name: `${rewardType} ${rewardNumber}`,
        value: `${node}`,
        inline: true
      };
    } else if (
      dir.AttackerReward.countedItems != undefined &&
      dir.DefenderReward.countedItems === undefined
    ) {
      var reward = dir.AttackerReward.countedItems[0];
      var rewardNumber = reward.ItemCount > 1 ? `(${reward.ItemCount})` : "";
      var rewardType = rewardsData[reward.ItemType.toLowerCase()]["value"] ===
        "Mutalist Alad V Nav Coordinate"
        ? `Alad V Nav Coordinate`
        : rewardsData[reward.ItemType.toLowerCase()]["value"];
      return {
        name: `${rewardType} ${rewardNumber}`,
        value: `${node}`,
        inline: true
      };
    }
  });
  var output = {
    embed: {
      color: 3447003,
      author: {
        name: "Invasions",
        icon_url: "https://d30y9cdsu7xlg0.cloudfront.net/png/38152-200.png"
      },
      fields: embedObject,
      timestamp: new Date(),
      footer: {
        text: "© ZufusNews"
      }
    }
  };
  return output;
}

function convertTime(ExpTime) {
  var time = [];
  var currentTime = new Date();
  var timeDiff = ExpTime - currentTime;
  if (timeDiff >= 86400000) {
    var days = Math.floor(timeDiff / 1000 / 60 / 60 / 24);
    time.push(`${days}d`);
  }
  if (timeDiff >= 3600000) {
    var hours = Math.round(timeDiff / 1000 / 60 / 60 % 24);
    time.push(`${hours}h`);
  }
  if (timeDiff >= 60000) {
    var minutes = Math.round(timeDiff / 1000 / 60 % 60);
    time.push(`${minutes}m`);
  }
  var seconds = Math.round(timeDiff / 1000) % 60;
  time.push(`${seconds}s`);
  return `*${time.join(" ")}*`;
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function findMatches(invasions) {
  var path = "MissionInfo.missionReward";
  var interestingRewards = require("./rewardsOfInterest.js");
  var matches = interestingRewards
    .map(function(rewards) {
      return invasions.filter(function(currentInvasions) {
        if (
          (currentInvasions[path].countedItems !== undefined &&
            currentInvasions[path].countedItems[0].ItemType.toLowerCase() ===
              rewards) ||
          (currentInvasions[path].items != undefined &&
            currentInvasions[path].items[0].toLowerCase() === rewards)
        ) {
          return currentInvasions;
        }
      });
    })
    .filter(function(empty) {
      return empty != "";
    });
  return matches;
}

function matchesExist(matches) {
  if (matches.length !== 0) {
    return matches.reduce(function(accum, currentVal) {
      return accum.concat(currentVal);
    });
  } else {
    return "nada";
  }
}

module.exports = function(callback, status) {
  getInvasionData(callback, status);
};

/*Working output format!!!!!!
function outputFormat(dataMap) {
  var output = dataMap[0].map(function(dir) {
    var node = nodeData[dir.Node]["value"];
    if (
      dir.AttackerReward.countedItems != undefined &&
      dir.DefenderReward.countedItems != undefined
    ) {
      var attReward = dir.AttackerReward.countedItems[0];
      var defReward = dir.DefenderReward.countedItems[0];
      return `  ${rewardsData[attReward.ItemType.toLowerCase()][
        "value"
      ]} (${attReward.ItemCount}) vs. ${rewardsData[
        defReward.ItemType.toLowerCase()
      ]["value"]} (${defReward.ItemCount}) *${node}*\n`;
    } else if (
      dir.AttackerReward.items != undefined &&
      dir.DefenderReward.items != undefined
    ) {
      var attReward = dir.AttackerReward.items[0];
      var defReward = dir.DefenderReward.items[0];
      return `  ${rewardsData[attReward.toLowerCase()][
        "value"
      ]} vs. ${rewardsData[defReward.toLowerCase()][
        "value"
      ]} *${node}*\n`;
    } else if (
      dir.AttackerReward.countedItems === undefined &&
      dir.DefenderReward.countedItems != undefined
    ) {
      var reward = dir.DefenderReward.countedItems[0];
      return `  ${rewardsData[reward.ItemType.toLowerCase()][
        "value"
      ]} (${reward.ItemCount}) *${node}*\n`;
    } else if (
      dir.AttackerReward.countedItems != undefined &&
      dir.DefenderReward.countedItems === undefined
    ) {
      var reward = dir.AttackerReward.countedItems[0];
      return `  ${reward.ItemCount} ${rewardsData[
        reward.ItemType.toLowerCase()
      ]["value"]} *${node}*\n`;
    }
  });
  output.unshift(`**Invasions**\n`);
  return output;
}*/
