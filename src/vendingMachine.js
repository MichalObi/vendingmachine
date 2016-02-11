export class vendingMachine {
  constructor(name) {

    this.name = name || 'defaultName';
    this.state = 'IDLE';
    this.pocket = [];
    this.items = [
    	{name: 'item1', price: 10},
      {name: 'item2', price: 11},
      {name: 'item3', price: 12}
    ],

    this.addItems = function(itemsList) {
    	this.items = this.items.concat(itemsList);
    },

    this.insertCoin = function(coin) {
      if (this.state === 'BROKEN') {
        return console.error('Machine broken');
      }
      var coins = 0;
      for (var i = 0, n = arguments.length; i < n; ++i) {
        coins += +arguments[i];
      }
      this.coins = coins;
      this.pocket.push(coins);
      this.dispatch();
    },

    this.dispatch = function() {
      if (this.state !== 'IDLE') {
        return;
      }
      this.cents = this.pocket.shift();
      this.state = 'WAIT_FOR_SELECT';
      if (this.cents !== undefined) {
         console.log('You have ' + this.cents + ' cents to spend.');
      }
    },

    this.select = function(item) {
      var selectedItem = item;
      
      if (this.state === 'IDLE') {
        return console.error('Please insert coin');
      }

      if (this.state !== 'WAIT_FOR_SELECT') {
        return console.error('Processing existing order');
      }
      
      for (var i = 1; i <= this.items.length; i++) {
        var currentItem = this.items[i];
        if(currentItem !==undefined && currentItem.name === selectedItem) {
            if (this.cents >= currentItem.price) {
                let change = this.cents - currentItem.price;
                console.log(change);
                this.spareChange(change);
                this.despense(currentItem);
            } else {
              console.log('Not enough money. Need more coins.');
            }
        } else if (currentItem === undefined) {
          console.log('No item in items list. Out of item.:<');
        } else {
          console.log('Searching item ... ');
        }
      }
    },

    this.spareChange = function(c) {
      console.log('Spare ' + c + ' cents.');
      this.state = 'IDLE';
      this.dispatch();
    },
    
    this.despense = function(item) {
      console.log('Remove ' + item.name + ' from items list.');
      var index = this.items.indexOf(item);
      this.items.splice(index, 1);
    },
    
    this.break = function(err) {
     console.error(err.message);
     this.state = 'BROKEN';
    }
  }
}


