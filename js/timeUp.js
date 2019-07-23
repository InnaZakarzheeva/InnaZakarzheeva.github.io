var TimeUp = {
    preload: function(){  /* Для маштабування, адаптивності
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
   */
        game.load.image('background', './assets/background.jpg');
        game.load.image('timeup', './assets/text-timeup.png');
    },
    create: function(){
        this.add.image(0,0,'background');
        this.add.image(20,300,'timeup');
    }
}