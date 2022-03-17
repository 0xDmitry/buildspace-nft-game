import React from 'react';
import './Players.css';

const Players = (props) => {
  const renderPlayers = () => {
    return props.items.map((player, index) => (
      <div className="player-item" key={player.character.name}>
        <img src={`https://cloudflare-ipfs.com/ipfs/${player.character.imageURI}`} alt={player.character.name} />
        <div className="player-info-container">
          <p>{player.address}</p>
          <p>{player.character.name}</p>
          <p>{`Total damage: ${player.dealedDamage}`}</p>
        </div>
      </div>
    ));
  }

  return <div className="players-container">
    <h2>{props.title}</h2>
    <div className="players-grid">
      {renderPlayers()}
    </div>
  </div>
}

export default Players;