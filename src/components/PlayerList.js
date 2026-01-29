import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import PlayerItem from './PlayerItem';

function PlayerList({
  players,
  renderItem,
  maxHeight = 400,
}) {
  return (
    <ScrollView style={[styles.list, { maxHeight }]}>
      {players.map(player =>
        renderItem ? renderItem(player) : <PlayerItem key={player.id} player={player} />,
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    maxHeight: 400,
  },
});

export default PlayerList;

