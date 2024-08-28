import {commandType} from '../interface/sceneInterface';

export const SCRIPT_CONFIG = [
  { scriptString: 'intro', scriptType: commandType.intro },
  { scriptString: 'changeBg', scriptType: commandType.changeBg },
  { scriptString: 'changeFigure', scriptType: commandType.changeFigure },
  { scriptString: 'miniAvatar', scriptType: commandType.miniAvatar },
  { scriptString: 'changeScene', scriptType: commandType.changeScene },
  { scriptString: 'choose', scriptType: commandType.choose },
  { scriptString: 'end', scriptType: commandType.end },
  { scriptString: 'bgm', scriptType: commandType.bgm },
  { scriptString: 'playVideo', scriptType: commandType.video },
  {
    scriptString: 'setComplexAnimation',
    scriptType: commandType.setComplexAnimation,
  },
  { scriptString: 'setFilter', scriptType: commandType.setFilter },
  { scriptString: 'pixiInit', scriptType: commandType.pixiInit },
  { scriptString: 'pixiPerform', scriptType: commandType.pixi },
  { scriptString: 'label', scriptType: commandType.label },
  { scriptString: 'jumpLabel', scriptType: commandType.jumpLabel },
  { scriptString: 'setVar', scriptType: commandType.setVar },
  { scriptString: 'callScene', scriptType: commandType.callScene },
  { scriptString: 'showVars', scriptType: commandType.showVars },
  { scriptString: 'unlockCg', scriptType: commandType.unlockCg },
  { scriptString: 'unlockBgm', scriptType: commandType.unlockBgm },
  { scriptString: 'say', scriptType: commandType.say },
  { scriptString: 'filmMode', scriptType: commandType.filmMode },
  { scriptString: 'callScene', scriptType: commandType.callScene },
  { scriptString: 'setTextbox', scriptType: commandType.setTextbox },
  { scriptString: 'setAnimation', scriptType: commandType.setAnimation },
  { scriptString: 'playEffect', scriptType: commandType.playEffect },
  { scriptString: 'applyStyle', scriptType: commandType.applyStyle },
  { scriptString: 'unlockAchieve', scriptType: commandType.unlockAchieve },
  { scriptString: 'unlockStoryline', scriptType: commandType.unlockStoryline },
  { scriptString: 'showValue', scriptType: commandType.showValue },
  { scriptString: 'payProduct', scriptType: commandType.payProduct },
  { scriptString: 'finishTrial', scriptType: commandType.finishTrial },
  { scriptString: 'moveCamera', scriptType: commandType.moveCamera },
  { scriptString: 'unlockAffinity', scriptType: commandType.unlockAffinity },
  { scriptString: 'popUpImage', scriptType: commandType.popUpImage },  
];
export const ADD_NEXT_ARG_LIST = [
  commandType.bgm,
  commandType.pixi,
  commandType.pixiInit,
  commandType.label,
  commandType.if,
  commandType.miniAvatar,
  commandType.setVar,
  commandType.unlockBgm,
  commandType.unlockCg,
  commandType.filmMode,
  commandType.playEffect,
  commandType.showValue
];

export type ConfigMap = Map<string, ConfigItem>;
export type ConfigItem = { scriptString: string; scriptType: commandType };
