var fieldSize = 5; 
var orbColors = 6;
var orbSize = 100;
//
var swapSpeed = 200;
var fallSpeed = 500;
var destroySpeed = 200;
var fastFall = true;
//
var gameArray = [];
var removeMap = [];
var orbGroup;
var selectedOrb; 
var canPick = true;
//
var hand;
var handTween;
//
var counter = 0;
var Start = {
    
    preload: function(){
         /* Для маштабування, адаптивності
     game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
     game.scale.pageAlignHorizontally = true;
     game.scale.pageAlignVertically = true;
*/
        game.load.image('background', './assets/background.jpg');
        //gem
        game.load.spritesheet('orbs', './assets/orbs.png', orbSize, orbSize);
        game.load.image('hand', './assets/hand.png')

        game.load.image('score', './assets/sc.png');

        game.load.audio('killSound', './assets/audio/kill.mp3');
        game.load.audio('selectSound', './assets/audio/select-1.mp3');
    },
    create: function(){
        this.add.image(0,0,'background');
        this.add.image(0,500, 'score');
        sound = this.add.audio('killSound');
        select = this.add.audio('selectSound');

        text = game.add.text(128, 550, '', { font: "60px Fredoka One", fill: "#ffffff"});

        drawField();
        showSuggestion();
        canPick = true;
        game.input.onDown.add(orbSelect);
        game.input.onUp.add(orbDeselect);

        this.timeInSeconds = 5;
        this.timeText = this.game.add.text(300, 540, "",{font: '79px Fredoka One', fill:'#000000'});
        this.timer = this.game.time.events.loop(Phaser.Timer.SECOND, this.updateTimer, this);
    },
    Sound: function(){
        sound.play();
    },
    SelectSound: function(){
        select.play();
    },
    updateTimer: function() {
        this.timeInSeconds--;
        var minutes = Math.floor(this.timeInSeconds / 60);
        var seconds = this.timeInSeconds - (minutes * 60);
        var timeString = this.addZeros(minutes) + ":" + this.addZeros(seconds);
        this.timeText.text = timeString;
    
        if (this.timeInSeconds == 0) {
            this.state.start('GameOver');
        }
    },
    addZeros: function(num) {
        if (num < 10) {
            num = "0" + num;
        }
        return num;
    }
}
function updateCounter() {
        counter++;
        text.setText(counter);
}
//Створює полотно гри, матриця n*n
function drawField(){
    orbGroup = game.add.group();
    for(var i = 0; i < fieldSize; i ++){
         gameArray[i] = [];
         for(var j = 0; j < fieldSize; j ++){
              var orb = game.add.sprite(orbSize * j + orbSize / 2, orbSize * i + orbSize / 2, "orbs");
              orb.anchor.set(0.5);
              orbGroup.add(orb);
              do{
                   var randomColor = game.rnd.between(0, orbColors - 1);  
                   orb.frame = randomColor;
                   gameArray[i][j] = {
                        orbColor: randomColor,
                        orbSprite: orb
                   }
              } while(isMatch(i, j));   
         }
    }
    selectedOrb = null;
    hand = game.add.sprite(0, 0, "hand");
    hand.anchor.set(0.5);
    hand.visible = false;
}

var val = 3;
//Рука вказує на можливі ходи
function showSuggestion(){
    var matchFound = false;
    for(var i = 0; i < fieldSize - 1; i ++){          
         for(var j = 0; j < fieldSize - 1; j ++){
              tmpSwap(i, j, i + 1, j);
              if(matchInBoard()){
                  if(val>0){
                    hand.visible = true;
                    val--;
                  } else {
                    hand.visible = false;
                  }
                   hand.x = gameArray[i + 1][j].orbSprite.x + 16;
                   hand.y = gameArray[i + 1][j].orbSprite.y + 70;
                   handTween = game.add.tween(hand).to({
                        y: hand.y + 100
                   }, 500, Phaser.Easing.Linear.None, true, 0, -1, true);
                   matchFound = true;
              }
              tmpSwap(i, j, i + 1, j);
              if(matchFound){
                   return;
              }   
              tmpSwap(i, j, i, j + 1);
              if(matchInBoard()){
                if(val>0){
                    hand.visible = true;
                    val--;
                  } else {
                    hand.visible = false;
                  }
                   hand.x = gameArray[i][j + 1].orbSprite.x + 16;
                   hand.y = gameArray[i][j + 1].orbSprite.y + 70;
                   handTween = game.add.tween(hand).to({
                        x: hand.x + 100
                   }, 500, Phaser.Easing.Linear.None, true, 0, -1, true);
                   matchFound = true;
              }
              tmpSwap(i, j, i, j + 1);
              if(matchFound){
                   return;
              }     
         }
    } 
    console.log("no match"); 
    for(var i = 0; i < fieldSize; i ++){
       // gameArray[i] = [];
        for(var j = 0; j < fieldSize; j ++){
             orbGroup.destroy();
        }
   } 
    drawField(); 
}
//
function tmpSwap(row1, col1, row2, col2){
    var tmp = gameArray[row1][col1];
    gameArray[row1][col1] = gameArray[row2][col2];
    gameArray[row2][col2] = tmp;     
}

function orbSelect(e){
    if(canPick){
         hand.visible = false;
         handTween.stop();
         var row = Math.floor(e.clientY / orbSize);
         var col = Math.floor(e.clientX / orbSize);
         var pickedOrb = gemAt(row, col)
         if(pickedOrb != -1){
              if(selectedOrb == null){
                   pickedOrb.orbSprite.scale.setTo(1.2);
                   pickedOrb.orbSprite.bringToTop();
                   selectedOrb = pickedOrb;
                   game.input.addMoveCallback(orbMove);
              }
              else{
                   if(areTheSame(pickedOrb, selectedOrb)){
                        selectedOrb.orbSprite.scale.setTo(1);
                        selectedOrb = null;
                   }
                   else{     
                        if(areNext(pickedOrb, selectedOrb)){
                             selectedOrb.orbSprite.scale.setTo(1);
                             swapOrbs(selectedOrb, pickedOrb, true);                  
                        }
                        else{
                             selectedOrb.orbSprite.scale.setTo(1);
                             pickedOrb.orbSprite.scale.setTo(1.2); 
                             selectedOrb = pickedOrb;  
                             game.input.addMoveCallback(orbMove);      
                        }
                   }
              }     
         }
    }
}

function orbDeselect(e){
    game.input.deleteMoveCallback(orbMove);     
}

function orbMove(event, pX, pY){
    if(event.id == 0){
         var distX = pX - selectedOrb.orbSprite.x;
         var distY = pY - selectedOrb.orbSprite.y;
         var deltaRow = 0;
         var deltaCol = 0;
         if(Math.abs(distX) > orbSize / 2){
              if(distX > 0){
                   deltaCol = 1;
              }
              else{
                   deltaCol = -1;
              }
         }
         else{
              if(Math.abs(distY) > orbSize / 2){
                   if(distY > 0){
                       deltaRow = 1;
                   }
                   else{
                        deltaRow = -1;
                   }
              }
         }
         if(deltaRow + deltaCol != 0){
              var pickedOrb = gemAt(getOrbRow(selectedOrb) + deltaRow, getOrbCol(selectedOrb) + deltaCol); 
              if(pickedOrb != -1){
                   selectedOrb.orbSprite.scale.setTo(1);
                   swapOrbs(selectedOrb, pickedOrb, true);
                   game.input.deleteMoveCallback(orbMove);
              }    
         }
    }
}

function swapOrbs(orb1, orb2, swapBack){ 
    canPick = false;   
    var fromColor = orb1.orbColor;
    var fromSprite = orb1.orbSprite;
    var toColor = orb2.orbColor;
    var toSprite = orb2.orbSprite;
    gameArray[getOrbRow(orb1)][getOrbCol(orb1)].orbColor = toColor;
    gameArray[getOrbRow(orb1)][getOrbCol(orb1)].orbSprite = toSprite;
    gameArray[getOrbRow(orb2)][getOrbCol(orb2)].orbColor = fromColor;
    gameArray[getOrbRow(orb2)][getOrbCol(orb2)].orbSprite = fromSprite;
    var orb1Tween = game.add.tween(gameArray[getOrbRow(orb1)][getOrbCol(orb1)].orbSprite).to({
         x: getOrbCol(orb1) * orbSize + orbSize / 2,
         y: getOrbRow(orb1) * orbSize + orbSize / 2
    }, swapSpeed, Phaser.Easing.Linear.None, true);     
    var orb2Tween = game.add.tween(gameArray[getOrbRow(orb2)][getOrbCol(orb2)].orbSprite).to({
         x: getOrbCol(orb2) * orbSize + orbSize / 2,
         y: getOrbRow(orb2) * orbSize + orbSize / 2
    }, swapSpeed, Phaser.Easing.Linear.None, true); 
    orb2Tween.onComplete.add(function(){
         if(!matchInBoard() && swapBack){
              swapOrbs(orb1, orb2, false);          
         }
         else{ 
              if(matchInBoard()){
                   handleMatches();
              }
              else{        
                   canPick = true;
                   selectedOrb = null;
              }
         }    
    });
}

function areNext(orb1, orb2){
    return Math.abs(getOrbRow(orb1) - getOrbRow(orb2)) + Math.abs(getOrbCol(orb1) - getOrbCol(orb2)) == 1;
}

function areTheSame(orb1, orb2){
    return getOrbRow(orb1) == getOrbRow(orb2) && getOrbCol(orb1) == getOrbCol(orb2);
}

function gemAt(row, col){
    if(row < 0 || row >= fieldSize || col < 0 || col >= fieldSize){
         return -1;
    }
    return gameArray[row][col];
}

function getOrbRow(orb){
    return Math.floor(orb.orbSprite.y / orbSize);
}

function getOrbCol(orb){
    return Math.floor(orb.orbSprite.x / orbSize);
}

function isHorizontalMatch(row, col){
    return gemAt(row, col).orbColor == gemAt(row, col - 1).orbColor && gemAt(row, col).orbColor == gemAt(row, col - 2).orbColor; 
}

function isVerticalMatch(row, col){
    return gemAt(row, col).orbColor == gemAt(row - 1, col).orbColor && gemAt(row, col).orbColor == gemAt(row - 2, col).orbColor; 
}

function isMatch(row, col){
    return isHorizontalMatch(row, col) || isVerticalMatch(row, col);
}

function matchInBoard(){
    for(var i = 0; i < fieldSize; i++){
         for(var j = 0; j < fieldSize; j++){
              if(isMatch(i, j)){
                   return true;
              }
         }
    }
    return false;
}

function handleMatches(){   
    removeMap = []; 
    for(var i = 0; i < fieldSize; i++){
         removeMap[i] = [];
         for(var j = 0; j < fieldSize; j++){
              removeMap[i].push(0);
         }
    }
    handleHorizontalMatches();
    handleVerticalMatches();
    destroyOrbs();
}

function handleVerticalMatches(){
    for(var i = 0; i < fieldSize; i++){
         var colorStreak = 1;
         var currentColor = -1;
         var startStreak = 0;
         for(var j = 0; j < fieldSize; j++){ 
              if(gemAt(j, i).orbColor == currentColor){
                   colorStreak ++;
              }              
              if(gemAt(j, i).orbColor != currentColor || j == fieldSize - 1){
                   if(colorStreak >= 3){
                        console.log("VERTICAL :: Length = "+colorStreak + " :: Start = ("+startStreak+","+i+") :: Color = "+currentColor);
                        switch(colorStreak){
                             case 3:
                                  for(var k = 0; k < colorStreak; k++){
                                       removeMap[startStreak + k][i] ++;
                                  }
                                  break;
                             case 4:
                                  for(var k = 0; k < fieldSize; k++){
                                       removeMap[k][i] ++;
                                  }
                                  break;
                             default:
                                  for(var k = 0; k < fieldSize; k++){
                                       for(var l = 0; l < fieldSize; l++){
                                            if(gemAt(k, l).orbColor == currentColor){
                                                 removeMap[k][l] ++;
                                            }
                                       }
                                  }            
                                  break;                              
                        }
                   }
                   startStreak = j;
                   colorStreak = 1;
                   currentColor = gemAt(j, i).orbColor;
              }
         }
    }
}

function handleHorizontalMatches(){
    for(var i = 0; i < fieldSize; i++){
         var colorStreak = 1;
         var currentColor = -1;
         var startStreak = 0;
         for(var j = 0; j < fieldSize; j++){ 
              if(gemAt(i, j).orbColor == currentColor){
                   colorStreak ++;
              }              
              if(gemAt(i, j).orbColor != currentColor || j == fieldSize - 1){
                   if(colorStreak >= 3){
                        console.log("HORIZONTAL :: Length = "+colorStreak + " :: Start = ("+i+","+startStreak+") :: Color = "+currentColor);
                        switch(colorStreak){
                             case 3:
                                  for(var k = 0; k < colorStreak; k++){
                                       removeMap[i][startStreak + k] ++;
                                  }
                                  break;
                             case 4:
                                  for(var k = 0; k < fieldSize; k++){
                                       removeMap[i][k] ++;
                                  }
                                  break;
                             default:
                                  for(var k = 0; k < fieldSize; k++){
                                       for(var l = 0; l < fieldSize; l++){
                                            if(gemAt(k, l).orbColor == currentColor){
                                                 removeMap[k][l] ++;
                                            }
                                       }
                                  }    
                                  break;                              
                        }
                   }
                   startStreak = j;
                   colorStreak = 1;
                   currentColor = gemAt(i, j).orbColor;
              }
         }
    }
}

function destroyOrbs(){
    var destroyed = 0;
    for(var i = 0; i < fieldSize; i++){
         for(var j = 0; j < fieldSize; j++){
              if(removeMap[i][j]>0){
                   var destroyTween = game.add.tween(gameArray[i][j].orbSprite).to({
                        alpha: 0
                   }, destroySpeed, Phaser.Easing.Linear.None, true);
                   destroyed ++;
                   destroyTween.onComplete.add(function(orb){
                        orb.destroy();
                        destroyed --;

                        Start.Sound();
                        //SCORE
                        updateCounter();
                        //
                        if(destroyed == 0){
                             makeOrbsFall();
                             if(fastFall){
                                  replenishField();
                             }    
                        }
                   });
                   gameArray[i][j] = null;  
              }
         }
    }
}
//?
function makeOrbsFall(){
    var fallen = 0;
    var restart = false;
    for(var i = fieldSize - 2; i >= 0; i--){
         for(var j = 0; j < fieldSize; j++){
              if(gameArray[i][j] != null){
                   var fallTiles = holesBelow(i, j);
                   if(fallTiles > 0){
                        if(!fastFall && fallTiles > 1){
                             fallTiles = 1;
                             restart = true;                             
                        }
                        var orb2Tween = game.add.tween(gameArray[i][j].orbSprite).to({
                             y: gameArray[i][j].orbSprite.y + fallTiles * orbSize
                        }, fallSpeed, Phaser.Easing.Linear.None, true); 
                        fallen ++;
                        orb2Tween.onComplete.add(function(){
                             fallen --;
                             if(fallen == 0){
                                  if(restart){
                                       makeOrbsFall();
                                  }
                                  else{
                                       if(!fastFall){
                                            replenishField();
                                       }
                                  }      
                             }
                        })
                        gameArray[i + fallTiles][j] = {
                             orbSprite: gameArray[i][j].orbSprite,
                             orbColor: gameArray[i][j].orbColor     
                        }
                        gameArray[i][j] = null;
                   }
              }
         }
    }
    if(fallen == 0){
         replenishField();     
    }
}

function replenishField(){
    var replenished = 0;
    var restart = false;
    for(var j = 0; j < fieldSize; j++){
         var emptySpots = holesInCol(j);
         if(emptySpots > 0){
              if(!fastFall && emptySpots > 1){
                   emptySpots = 1;
                   restart = true;   
              }
              for(i = 0; i < emptySpots; i++){
                   var orb = game.add.sprite(orbSize * j + orbSize / 2, - (orbSize * (emptySpots - 1 - i) + orbSize / 2), "orbs");
                   orb.anchor.set(0.5);
                   orbGroup.add(orb);
                   var randomColor = game.rnd.between(0, orbColors - 1);  
                   orb.frame = randomColor;
                   gameArray[i][j] = {
                        orbColor: randomColor,
                        orbSprite: orb
                   }
                   var orb2Tween = game.add.tween(gameArray[i][j].orbSprite).to({
                        y: orbSize * i + orbSize / 2
                   }, fallSpeed, Phaser.Easing.Linear.None, true);
                   replenished ++;  
                   orb2Tween.onComplete.add(function(){
                        replenished --;
                        if(replenished == 0){
                             if(restart){
                                  makeOrbsFall();
                             }
                             else{
                                  if(matchInBoard()){
                                       game.time.events.add(250, handleMatches);
                                  }
                                  else{
                                       canPick = true;
                                       selectedOrb = null;
                                       showSuggestion();
                                  }  
                             }
                        }
                   }) 
              }
         }
    }
}

function holesBelow(row, col){
    var result = 0;
    for(var i = row + 1; i < fieldSize; i++){
         if(gameArray[i][col] == null){
              result ++;          
         }
    }
    return result;
}

function holesInCol(col){
    var result = 0;
    for(var i = 0; i < fieldSize; i++){
         if(gameArray[i][col] == null){
              result ++;          
         }
    }
    return result;     
}