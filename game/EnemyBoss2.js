
P4.EnemyBoss2 = function()
{
	P4.EnemyBoss2.superproto.constructor.call(this)
}

GO.Util.extend(P4.EnemyBoss2, P4.EnemyBoss)

P4.EnemyBoss2.prototype.size = 2
P4.EnemyBoss2.prototype.color = '127,255,0'

P4.EnemyBoss2.prototype.fire = function()
{
	GO.Sound.play('boss_fire')

	for (var i = 0; i < 2; i += 1) {
		var c = { r: 255, g: 255, b: -1 }
			,ec = { r: 255, g: 255, b: -1 }
			,a = new P4.EnemyShip(c, ec)

		a.x = this.x - 20 + (Math.random() * 20)
		a.y = this.y - 20 + (Math.random() * 20)
		a.v = 1 + (Math.random() * 2)
		a.size = 0.2
		a.canFire = false
		a.canFlyAway = false
		a.explodeLifetime = 1 / 20
		GO.scenes.game.layers.fg.push(a)
	}
}

P4.EnemyBoss2.prototype.drawEnergy = function()
{
	GO.ctx.textBaseline = 'middle'
	GO.ctx.textAlign = 'center'
	GO.ctx.font = '8px ' + GO.config.fontName
	GO.ctx.fillStyle = 'white'
	GO.ctx.fillText('BOSS : ' + this.life, GO.Screen.width / 2, 20 + (this.pos * 20))
}

