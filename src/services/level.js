import { Player } from '../sprites/Player'
import { ObjectSprite, NAMES } from '../sprites/Object'

export default class LevelService {
  constructor(scene, key) {
    this.scene = scene
    this.map = scene.make.tilemap({ key })

    const groundTiles = this.map.addTilesetImage('tilemap')
    this.groundLayer = this.map.createDynamicLayer('World', groundTiles, 0, 0)
    this.groundLayer.setCollisionByExclusion([-1])

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
  }
}
