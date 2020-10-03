export class Trigger extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, object) {
    super(scene, object.x, object.y)
    this.overlap = this.overlap.bind(this)
    this.object = object
    this.scene.physics.world.enable(this)
    this.scene.add.existing(this)
    this.setOrigin(0)
    this.setSize(object.width, object.height, false)

    this.hasTriggered = false
  }

  overlap() {
    if (
      this.hasTriggered &&
      (!this.object.properties ||
        !this.object.properties.some((p) => p.name === 'continuous'))
    )
      return
    this.hasTriggered = true
    this.scene.level.trigger(this.object.name)
  }
}
