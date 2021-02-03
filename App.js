import React, { Component} from 'react';
import {Alert,StyleSheet, Dimensions, View } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import RNRestart from 'react-native-restart';
import {Accelerometer} from "expo-sensors";
import Matter from 'matter-js';
import Circle from './src/components/Circle';
import Rectangle from './src/components/Rectangle';
import CreateMaze from './src/helpers/CreateMaze';
import GetRandomPoint from './src/helpers/GetRandomPoint';


const { height, width } = Dimensions.get('window');

// generate new maze

// todo add dificulty modulator for grid nums

const GRID_X = 10; 
const GRID_Y = 13; 
const maze = CreateMaze(GRID_X, GRID_Y);



// create a ball obj

const BALL_SIZE = Math.floor(width * .02);
const ballStartPoint = GetRandomPoint(GRID_X,GRID_Y);
const theBall = Matter.Bodies.circle(
  ballStartPoint.x,
  ballStartPoint.y,
  BALL_SIZE,
  {label:'ball'}
);

// create the GOAL

const GOAL_SIZE = Math.floor(width * .05);
const goalPoint = GetRandomPoint(GRID_X,GRID_Y);
const goal = Matter.Bodies.rectangle(goalPoint.x, goalPoint.y, GOAL_SIZE, GOAL_SIZE, {
  isSensor: true,
  isStatic: true,
  label: 'goal'
});

// set Ball sensitivity lower = faster
Accelerometer.setUpdateInterval(30);

export default class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      ballX: theBall.position.x,
      ballY: theBall.position.y,
    }
  }
    _setupCollisionHandler = (engine) => {
    Matter.Events.on(engine, 'collisionStart', event =>{
      var pairs = event.pairs;

      var objA = pairs[0].bodyA.label;
      var objB = pairs[0].bodyB.label;

      if(objA === 'ball' && objB === 'goal') {
        Alert.alert(
          'You have escaped the Ravens Maze!',
          'play again?',
          // TODO add win counter
          [
            {
              text: 'Yes',
              onPress: () => {
                RNRestart.Restart();
              }
            }
          ],
          {cancelable: true},
        );
      } else if (objA === 'wall' && objB === 'ball'){
        // TODO add try counter
        Matter.Body.setPosition(theBall,{
          x: ballStartPoint.x,
          y: ballStartPoint.y
        });
        this.setState({
          ballX:ballStartPoint.x,
          ballY: ballStartPoint.y
        });
      }

    });
  }

  componentDidMount() {
    const { engine, world } = this._addObjectsToWorld(maze, theBall, goal);
    this.entities = this._getEntities(engine, world, maze, theBall, goal);
  
    this._setupCollisionHandler(engine);
    
    Accelerometer.addListener(({x,y}) =>{
      Matter.Body.setPosition(theBall, {
        x: this.state.ballX + x,
        y: this.state.ballY + y
      });

      this.setState({
        ballX : x + this.state.ballX,
        ballY: y + this.state.ballY,
      });

    });
  }

  physics = (entities, { time }) => {
    let engine = entities["physics"].engine;
    engine.world.gravity = {
      x: 0,
      y: 0
    };
    Matter.Engine.update(engine, time.delta);
    return entities;
  }

  _addObjectsToWorld = (maze, ball, goal) =>{
    const engine = Matter.Engine.create({enableSleeping:false});
    const world = engine.world;

    Matter.World.add(world,[
      maze,
      ball,
      goal
    ]);

    return {
      engine,
      world
    }
  }

  _getEntities = (engine, world, maze, ball, goal) =>{
    const entities = {
      physics: {
        engine,
        world
      },
      playerBall : {
        body : ball,
        bgColor: '#FF5877',
        borderColor: '#FFC1C1',
        renderer: Circle
      },

      goalBox:{
        body : goal,
        color:'#1277ff',
        size: [GOAL_SIZE,GOAL_SIZE],
        renderer: Rectangle
      }
    }

    const walls = Matter.Composite.allBodies(maze);

    console.log('walls are here lotst of them', walls);


    walls.forEach((body,index) =>{
      const {min,max} = body.bounds;
      const width = max.x - min.x;
      const height = max.y - min.y;
      console.log('ima a bloody body',body.position)
      Object.assign(entities, {
        ['wall_'+ index]: {
          body: body,
          size: [width,height],
          color: '#000',
          renderer: Rectangle
        }
      });

    });
    console.table('walls after',entities)
    return entities;
  }
  
  render() {
    if (this.entities) {
      return (
        <View style={styles.container}>
          <GameEngine
            systems={[this.physics]}
            entities={this.entities}
          >
          </GameEngine>
        </View>
      );
    }
    return null;
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
});