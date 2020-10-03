export class Spike extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, object) {
    super(scene, object.x, object.y - 60, 'tilemap', 574)
    this.overlap = this.overlap.bind(this)
    this.scene = scene
    this.scene.add.existing(this)
    this.scene.physics.world.enable(this)
    this.setSize(60, 35, false).setOrigin(0).setOffset(0, 30)
  }
  overlap(player) {
    player.damage(10)
  }
}
