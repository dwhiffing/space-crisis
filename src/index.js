import Phaser from 'phaser'
import * as scenes from './scenes'

const game = new Phaser.Game({
  transparent: true,
  type: navigator.userAgent.includes('Chrome') ? Phaser.WEBGL : Phaser.CANVAS,
  parent: 'phaser-example',
  width: 170,
  height: 120,
  pixelArt: true,
  zoom: 10,
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
      tileBias: 16,
      // debug: true,
    },
  },
  scene: Object.values(scenes),
})

export default game
