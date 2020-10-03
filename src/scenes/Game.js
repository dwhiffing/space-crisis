import InputService from '../services/input'
import LevelService from '../services/level'

export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
    this.overlap = this.overlap.bind(this)
  }

  create() {
    this.background = this.add
      .tileSprite(0, 0, 1920, 1080, 'background')
      .setScrollFactor(0)

    this.level = new LevelService(this, `map`)
    this.width = this.level.map.widthInPixels
    this.height = this.level.map.heightInPixels

    this.physics.world.bounds.width = this.width
    this.physics.world.bounds.height = this.height
    this.physics.add.collider(this.level.pushers, this.level.groundLayer)
    this.physics.add.collider(this.level.pushers, this.level.pushers)
    this.physics.add.overlap(
      this.level.playerGroup,
      this.level.pickups,
      this.overlap,
    )

    this.cameras.main.setBounds(0, 0, this.width, this.height)
    this.background.setTint(0xe86a17)
    this.activePlayer = this.level.player
    this.cameras.main.setLerp(0.2, 0.2)

    this.inputService = new InputService(this)
    this.iter = 0
  }

  update(time, delta) {
    this.iter += 0.001
    this.background.tilePositionX = Math.cos(-this.iter) * 400
    this.background.tilePositionY = Math.sin(-this.iter) * 400
    this.inputService.update(time, delta)
    this.activePlayer.update()
  }

  overlap(player, object) {
    object.overlap(player, () => {})
  }
}
