const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTRACT_ADDRESS = '0x3a213fa78Bf6e8dE4A48fC5Adc4DC2A6423936A6';

const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
  };
};

const transformPlayerData = (playerData) => {
  return {
    address: playerData.playerAddress,
    character: transformCharacterData(playerData.characterAttributes),
    dealedDamage: playerData.dealedDamage.toNumber()
  };
}

export { TWITTER_HANDLE, TWITTER_LINK, CONTRACT_ADDRESS, transformCharacterData, transformPlayerData };