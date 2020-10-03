import Phaser from 'phaser'
import * as scenes from './scenes'

const game = new Phaser.Game({
  transparent: true,
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 960,
  height: 540,
  pixelArt: true,
  input: {
    activePointers: 3,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      fps: 60,
      tileBias: 64,
      gravity: { y: 2000 },
      debug: true,
    },
  },
  scene: Object.values(scenes),
})

export default game
