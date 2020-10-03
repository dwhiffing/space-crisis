import { Player } from '../sprites/Player'
import { ObjectSprite, NAMES } from '../sprites/Object'

export default class LevelService {
  constructor(scene, key) {
    this.scene = scene
    this.map = scene.make.tilemap({ key })

    const groundTiles = this.map.addTilesetImage('tilemap')
    this.groundLayer = this.map.createDynamicLayer('World', groundTiles, 0, 0)
    this.groundLayer.setCollisionByExclusion([-1])

    this.groundLayer.layer.data.forEach(function (row) {
      row.forEach(function (tile) {
        if (tile.index === 159) {
          tile.collideDown = false
          tile.collideRight = false
          tile.collideLeft = false
        }
      })
    })

    this.playerGroup = scene.add.group()
    this.coins = scene.physics.add.group({ allowGravity: false })

    this.objLayer = this.map.getObjectLayer('Objects')
    this.objLayer.objects.forEach((object) => {
      if (object.type === 'spawn') {
        this.player = new Player(scene, object)
      }

      if (object.type === 'coin') {
        this.coins.add(new ObjectSprite(scene, object))
      }
    })

    this.playerGroup.add(this.player)

    this.pushers = [this.playerGroup]
    this.pickups = [this.coins]

    this.width = this.map.widthInPixels
    this.height = this.map.heightInPixels

    scene.physics.world.bounds.width = this.width
    scene.physics.world.bounds.height = this.height
    scene.physics.add.collider(this.pushers, this.groundLayer)
    scene.physics.add.collider(
      this.player.bullets,
      this.groundLayer,
      (bullet, tile) => {
        bullet.destroy()
        if (tile.index === 195)
          tile.layer.tilemapLayer.removeTileAt(tile.x, tile.y)
      },
    )
    scene.physics.add.collider(this.pushers, this.pushers)
    scene.physics.add.overlap(
      this.playerGroup,
      this.pickups,
      (player, object) => {
        object.overlap(player, () => {})
      },
    )

    this.scene.cameras.main.setBounds(0, 0, this.width, this.height)
    this.scene.cameras.main.setLerp(0.2, 0.2)
  }
}
