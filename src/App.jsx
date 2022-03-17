import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import './App.css';
import twitterLogo from './assets/twitter-logo.svg';
import LoadingIndicator from './Components/LoadingIndicator';
import SelectCharacter from './Components/SelectCharacter';
import Arena from './Components/Arena';
import Players from './Components/Players';
import { TWITTER_HANDLE, TWITTER_LINK, CONTRACT_ADDRESS, transformCharacterData, transformPlayerData } from './constants';
import myEpicGame from './utils/MyEpicGame.json';

const App = () => {
  // State
  const [currentAccount, setCurrentAccount] = useState(null);
  const [gameContract, setGameContract] = useState(null);
  const [otherPlayers, setOtherPlayers] = useState([]);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Actions
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  // UseEffects
  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log('Ethereum object not found');
    }

    setIsLoading(true);
    checkIfWalletIsConnected();
    checkNetwork();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        setIsLoading(false);
        return;
      } else {
        console.log('We have the ethereum object', ethereum);

        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found');
        }
      }
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  const checkNetwork = async () => {
    try {
      if (window.ethereum.networkVersion !== '4') {
        alert("Please connect to Rinkeby!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);

      if (!gameContract) {
        return;
      }

      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No character NFT found');
      }

      setIsLoading(false);
    };

    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchPlayers();
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  useEffect(() => {
    const onCharacterMint = async () => {
      fetchPlayers();
    };

    const onAttackComplete = async () => {
      fetchPlayers();
    };

    if (gameContract) {
      gameContract.on('CharacterNFTMinted', onCharacterMint);
      gameContract.on('AttackComplete', onAttackComplete);
    }

    return () => {
      if (gameContract) {
        gameContract.off('CharacterNFTMinted', onCharacterMint);
        gameContract.off('AttackComplete', onAttackComplete);
      }
    };
  }, [gameContract]);

  const fetchPlayers = async () => {
    const txn = await gameContract.getAllPlayers();
    const players = txn
      .map((playerData) =>
        transformPlayerData(playerData)
      )
      .filter((player) => {
        console.log("fetchPlayers", player.address, currentAccount);
        return player.address.toLowerCase() != currentAccount.toLowerCase();
      });
    setOtherPlayers(players);
  };

  // Render Methods
  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
            alt="Monty Python Gif"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect Wallet To Get Started
        </button>
        </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else if (currentAccount && characterNFT) {
      return <Arena currentAccount={currentAccount} characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Metaverse Slayer ⚔️</p>
          <p className="sub-text">Team up to protect the Metaverse!</p>
          {renderContent()}
        </div>
        {otherPlayers.length > 0 && (
          <Players title={"Other fighters"} items={otherPlayers} />
        )}
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
