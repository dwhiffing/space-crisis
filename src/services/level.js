import { Player } from '../sprites/Player'
import { ObjectSprite } from '../sprites/Object'
import { Enemy } from '../sprites/Enemy'
import { Trigger } from '../sprites/Trigger'
import { Spike } from '../sprites/Spike'

export default class LevelService {
  constructor(scene, key) {
    this.scene = scene
    this.trigger = this.trigger.bind(this)
    this.map = scene.make.tilemap({ key })

    const groundTiles = this.map.addTilesetImage('tilemap')
    this.groundLayer = this.map.createDynamicLayer('World', groundTiles, 0, 0)
    const overlay = this.map.createDynamicLayer('Overlay', groundTiles, 0, 0)
    overlay.setDepth(99)
    this.groundLayer.setCollisionByExclusion([-1, 26])

    this.groundLayer.layer.data.forEach(function (row) {
      row.forEach(function (tile) {
        if (tile.index === 3) {
          tile.collideDown = false
          tile.collideRight = false
          tile.collideLeft = false
        }
      })
    })

    this.playerGroup = scene.add.group()
    this.coins = scene.physics.add.group({ allowGravity: false })
    this.enemies = scene.physics.add.group()
    this.triggers = scene.physics.add.group({ allowGravity: false })
    this.spikes = scene.physics.add.group({ allowGravity: false })
    this.spawners = []

    this.objLayer = this.map.getObjectLayer('Objects')
    this.objLayer.objects.forEach((object) => {
      if (object.type === 'spawn') {
        this.player = new Player(scene, object)
      }
      if (object.type === 'enemy-spawn') {
        this.spawners.push(object)
      }

      if (object.type === 'coin' || object.type === 'upgrade') {
        this.coins.add(new ObjectSprite(scene, object))
      }

      if (object.type === 'spike') {
        this.spikes.add(new Spike(scene, object))
      }

      if (object.type === 'trigger') {
        this.triggers.add(new Trigger(scene, object))
      }

      if (object.type === 'enemy') {
        this.enemies.add(new Enemy(scene, object))
      }
    })

    this.playerGroup.add(this.player)

    this.pickups = [this.coins, this.triggers, this.spikes]

    this.width = this.map.widthInPixels
    this.height = this.map.heightInPixels

    scene.physics.world.bounds.width = this.width
    scene.physics.world.bounds.height = this.height
    this.playerCollider = scene.physics.add.collider(
      this.player,
      this.groundLayer,
      (player, tile) => {
        if (tile.index === 3) {
          player.canFall = true
        } else {
          player.canFall = false
        }
      },
    )
    scene.physics.add.collider(this.enemies, this.groundLayer)
    scene.physics.add.overlap(
      [this.player, this.player.bullets],
      this.enemies,
      (bulletOrPlayer, enemy) => {
        if (bulletOrPlayer.name === 'red') {
          bulletOrPlayer.damage(10)
        } else if (bulletOrPlayer.active) {
          bulletOrPlayer.destroy()
          enemy.damage(bulletOrPlayer.damageAmount || 5)
        }
      },
    )
    scene.physics.add.collider(
      this.player.bullets,
      this.groundLayer,
      (bullet, tile) => {
        bullet.destroy()
        // normal door door
        if (tile.index === 5)
          tile.layer.tilemapLayer.removeTileAt(tile.x, tile.y)
        // red door (missiles)
        if (bullet.isMissile && tile.index === 6)
          tile.layer.tilemapLayer.removeTileAt(tile.x, tile.y)
        // blue door (charge)
        if (this.player.unlocks.gun >= 3 && tile.index === 7)
          tile.layer.tilemapLayer.removeTileAt(tile.x, tile.y)
        // green door (boss)
        if (this.player.unlocks.bossKey >= 1 && tile.index === 8)
          tile.layer.tilemapLayer.removeTileAt(tile.x, tile.y)
      },
    )
    scene.physics.add.overlap(
      this.playerGroup,
      this.pickups,
      (player, object) => {
        object.overlap(player, () => {})
      },
    )

    this.scene.cameras.main.setBounds(0, 0, this.width, this.height)
  }

  trigger(name) {
    const triggeredSpawners = this.spawners.filter((s) =>
      s.properties.some((p) => p.name === 'trigger' && p.value === name),
    )
    if (name === 'trigger-heat-damage' && !this.player.unlocks.armor) {
      this.player.damage(5)
    }
    triggeredSpawners.forEach((s) => {
      this.enemies.add(new Enemy(this.scene, s))
    })
  }

  update() {
    this.enemies.children.entries.forEach((e) => e.update.call(e))
  }
}
