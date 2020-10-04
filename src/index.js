import Phaser from 'phaser'
import * as scenes from './scenes'

let scale = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 3 : 6

const game = new Phaser.Game({
  transparent: true,
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: Math.floor(window.innerWidth / scale),
  height: Math.floor(window.innerHeight / scale),
  pixelArt: true,
  zoom: scale,
  input: {
    activePointers: 3,
  },
  scale: {
    // mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      fps: 60,
      tileBias: 16,
      // gravity: { y: 2000 },
      debug: true,
    },
  },
  scene: Object.values(scenes),
})

export default game
