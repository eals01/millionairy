import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Canvas } from '@react-three/fiber'
import { Physics, Debug } from '@react-three/cannon'
import { OrbitControls } from '@react-three/drei'
import socket from '../../socket'

import Piece from './components/Piece/Piece'
import Dice from './components/Dice/Dice'
import Chance from './components/Chance/Chance'
import Fortune from './components/Fortune/Fortune'
import Board from './components/Board/Board'
import House from './components/House/House'
import PropertyCard from './components/PropertyCard/PropertyCard'
import Table from './components/Table/Table'
import Money from './components/Money/Money'

import { Player } from '../../../../types/Player'
import Chat, { ChatContainer } from '../../components/Chat'

export default function Game() {
  const [loaded, setLoaded] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [isCurrentPlayer, setIsCurrentPlayer] = useState(false)

  useEffect(() => {
    socket.emit('gamePageEntered')

    socket.on('updateLobby', (lobby) => {
      setLoaded(true)
      setPlayers(lobby.players)
      setIsCurrentPlayer(
        lobby.players[lobby.currentPlayerIndex].id === socket.id
      )
    })

    return () => {
      socket.off('updateLobby')
    }
  }, [])

  function throwDice() {
    socket.emit('throwDice')
  }

  if (!loaded) return null
  return (
    <GameContainer>
      <Chat />
      <div
        style={{
          position: 'absolute',
          zIndex: 1,
          bottom: 20,
          right: 20,
          width: 400,
          height: 200,
          background: 'rgba(255,255,255,0.5)',
        }}
      >
        <button onClick={throwDice}>Throw dice</button>
        <div>
          {players.map((player, index) => {
            return (
              <div key={index} style={{ display: 'flex' }}>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    background: player.color,
                  }}
                />
                <span>
                  <b>{player.id.substring(0, 3)}</b>
                  <span style={{ marginLeft: '16px' }}>
                    space: {player.currentSpace}
                  </span>
                </span>
                {player.id === socket.id && (
                  <span style={{ marginLeft: '16px' }}>(you)</span>
                )}
              </div>
            )
          })}
          <p>Your turn: {isCurrentPlayer.toString()}</p>
        </div>
      </div>
      <Canvas camera={{ position: [100, 0, 0], fov: 40 }}>
        <ambientLight intensity={0.3} />
        <spotLight
          intensity={0.6}
          angle={1}
          penumbra={1}
          position={[50, 100, 50]}
        />
        <OrbitControls
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 3}
          enableZoom={false}
          enablePan={false}
        />
        <Physics allowSleep={true}>
          <Debug>
            {players.map((player, index) => {
              return <Piece key={player.id} player={player} offset={index} />
            })}
            <House color='red' />
            {[...Array(3)].map((__, columnIndex) =>
              [...Array(3)].map((__, index) => (
                <PropertyCard
                  key={columnIndex + index + 'pc'}
                  offsetX={index * 2}
                  offsetY={index}
                  offsetZ={columnIndex * -6}
                />
              ))
            )}
            {[...Array(3)].map((_, columnIndex) =>
              [...Array(10)].map((_, index) => (
                <Money
                  key={columnIndex + index + 'm'}
                  height={index}
                  offsetZ={columnIndex * 6}
                />
              ))
            )}
            <Dice offset={0} active={isCurrentPlayer} />
            <Dice offset={2} active={isCurrentPlayer} />
            {[...Array(20)].map((__, index) => (
              <Chance height={index / 4} key={`chance${index}`} />
            ))}
            {[...Array(20)].map((__, index) => (
              <Fortune height={index / 4} key={`fortune${index}`} />
            ))}
            <Board />
            <Table />
          </Debug>
        </Physics>
      </Canvas>
    </GameContainer>
  )
}

const GameContainer = styled.div`
  width: 100%;
  height: 100%;

  > ${ChatContainer} {
    z-index: 1;
    position: absolute;
    right: 2em;
    top: 2em;
  }
`
