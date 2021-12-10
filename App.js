import React, { Component } from 'react';
import { Easing, Animated } from 'react-native';
import { StackNavigator } from 'react-navigation'
import {createMaterialTopTabNavigator} from 'react-navigation-tabs'
import { NavigationContainer } from '@react-navigation/native';
import { NavigationContext } from '@react-navigation/native';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';
import HomeScreen from './screens/home';
import SettingsScreen from './screens/settings';
import SolvesScreen from './screens/solves';
import AsyncStorage  from "@react-native-async-storage/async-storage";
import RNIap from 'react-native-iap';

import { Provider } from 'react-redux'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'
import themeReducer from './redux/themeReducer'

import { MyContext } from "./context";

const store = createStore(
  combineReducers({ themeReducer}),
  applyMiddleware(thunk)
)

const SwipeTabs = createMaterialTopTabNavigator(
  {
    SettingsScreen: {
      screen: SettingsScreen
    },
    HomeScreen: {
      screen: HomeScreen,
        navigationOptions: {},
    },
    SolvesScreen: {
      screen: SolvesScreen
    },
  },
  {
    initialRouteName: "HomeScreen",
    animationEnabled: true,
    tabBarOptions: {
      showLabel: false,
      showIcon: false,
      style: { height: 0 }
    }
  }
);


const NavigationApp = createAppContainer(SwipeTabs);

export default class App extends Component {

  constructor (props){
    super(props);

    this.state = {
        test: 'test',
        solves: [],
        solvesCount: 0,

        currentSolve: '-',
        mean: '-',
        ao5: '-',
        ao12: '-',
        ao100: '-',

        bestSolve: '-',
        bestMean: '-',
        bestAo5: '-',
        bestAo12: '-',
        bestAo100: '-',

        selectedCube: '3x3',
    };
  }

  componentDidMount = async() => {
    this.getSolves();
  }

  getSolves = async() => {
    var solves = await AsyncStorage.getItem('solves');
    if (solves != null){
      solves = JSON.parse(solves);
      solves = solves['solves'];

      //filter solves with cube type
      var cubeType = this.state.selectedCube;
      var filteredArray = []

      solves.forEach(solve => {
          if (solve['cubeType'] == cubeType){filteredArray.push(solve)}
      });

      var solvesCount = filteredArray.length;

      filteredArray.reverse();
      this.setState({solves: filteredArray, solvesCount: solvesCount});
    }
  }

  setSolves = (solves) => {
    this.setState({solves: solves})
  }

  setSolvesCount = (count) => {
    this.setState({solvesCount: count})
  }

  setSelectedCube = (cubeType) => {
    this.setState({selectedCube: cubeType})
  }

  displayAverages = async () => {
        
    //get averages
    var solves = await AsyncStorage.getItem("solves");
    if (solves != null)
    {
    solves = JSON.parse(solves);
    solves = solves['solves'];

    //filter solves with cube type
    var filteredArray = []
    solves.forEach(solve => {
        if (solve['cubeType'] == this.state.selectedCube){filteredArray.push(solve)}
    });
    solves = filteredArray;

    if (solves.length > 0){
        solves.reverse();
        var lastSolve = solves[0];
        this.setState({currentSolve: lastSolve['time'], mean: lastSolve['mean'], ao5: lastSolve['ao5'], ao12: lastSolve['ao12'], ao100: lastSolve['ao100']})
    

        //get best averages
        var times = [];
        var means = [];
        var ao5s = [];
        var ao12s = [];
        var ao100s = [];

        var minAo5 = '-';
        var minAo12 = '-';
        var minAo100 = '-';

        solves.forEach(element => {
            times.push(Number(element['timeInSeconds']));
            means.push(Number(element['meanInSeconds']));
            if (solves.length >= 5)
            {
            if (!Number(element['ao5InSeconds']) == 0){
                    ao5s.push(Number(element['ao5InSeconds']));
                } 

                minAo5 =  Math.min(...ao5s);
                if(minAo5>60){minAo5 = this.secToMin(minAo5)}
            }
            
            if (solves.length >= 12)
            {
            if (! Number(element['ao12InSeconds']) == 0){
                    ao12s.push(Number(element['ao12InSeconds']));
                } 

                minAo12 = Math.min(...ao12s);
                if(minAo12>60){minAo12 = this.secToMin(minAo12)}
            }

            if (solves.length >= 100)
            {
                if (! Number(element['ao100InSeconds']) == 0){
                    ao100s.push(Number(element['ao100InSeconds']));
                }

                minAo100 = Math.min(...ao100s);
                if(minAo100>60){minAo100 = this.secToMin(minAo100)}
            }
            
            
        });
        var minTime = Math.min(...times);
        if(minTime>60){minTime = this.secToMin(minTime)}

        var minMean = Math.min(...means);
        if(minMean>60){minMean = this.secToMin(minMean)}
        this.setState({bestSolve: minTime, bestMean: minMean, bestAo5: minAo5, bestAo12: minAo12, bestAo100: minAo100})
    }
    else{this.setState({currentSolve: '-', mean: '-', ao5: '-', ao12: '-', ao100: '-', bestSolve: '-', bestMean: '-', bestAo5: '-', bestAo12: '-', bestAo100: '-'})}
    }
  }

  
  render(){
    return(
      <MyContext.Provider value={{...this.state, setSolves: this.setSolves, getSolves: this.getSolves, setSolvesCount: this.setSolvesCount, displayAverages: this.displayAverages, setSelectedCube: this.setSelectedCube}}>
        <Provider store={store}>
          <NavigationApp/>
        </Provider>
      </MyContext.Provider>
    ) 
  }
}
