
P4.EnemyShipBlue = function()
{
	var c = { r: 0, g: 255, b: 255 }
		,ec = { r: -1, g: 255, b: 255 }
	
	P4.EnemyShipBlue.superproto.constructor.call(this, c, ec)

	this.v = 0.3
}

GO.Util.extend(P4.EnemyShipBlue, P4.EnemyShip)

/************************************************************************/

P4.EnemyShipPurple = function()
{
	var c = { r: 255, g: 0, b: 201 }
		,ec = { r: 255, g: -1, b: 201 }
	
	P4.EnemyShipPurple.superproto.constructor.call(this, c, ec)

	this.v = 0.4
}

GO.Util.extend(P4.EnemyShipPurple, P4.EnemyShip)

/************************************************************************/

P4.EnemyShipYellow = function()
{
	var c = { r: 204, g: 255, b: 0 }
		,ec = { r: 204, g: 255, b: -1 }
	
	P4.EnemyShipYellow.superproto.constructor.call(this, c, ec)
}

GO.Util.extend(P4.EnemyShipYellow, P4.EnemyShip)

/************************************************************************/

P4.EnemyShipOrange = function()
{
	var c = { r: 231, g: 53, b: 37 }
		,ec = { r: 231, g: -1, b: 37 }
	
	P4.EnemyShipOrange.superproto.constructor.call(this, c, ec)
}

GO.Util.extend(P4.EnemyShipOrange, P4.EnemyShip)

/************************************************************************/

P4.EnemyShipLime = function()
{
	var c = { r: 120, g: 231, b: 84 }
		,ec = { r: 120, g: -1, b: 84 }
	
	P4.EnemyShipLime.superproto.constructor.call(this, c, ec)
}

GO.Util.extend(P4.EnemyShipLime, P4.EnemyShip)

