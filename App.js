import React, { Component } from 'react';
import { Easing, Animated, Alert } from 'react-native';
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

import { Provider } from 'react-redux'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'
import themeReducer from './redux/themeReducer'

import { MyContext } from "./context";
// import IAP from 'react-native-iap';

// const productIds = [ 'com.kyuubi.removeAds']

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
        mo3: '-',
        ao5: '-',
        ao12: '-',
        ao100: '-',

        bestSolve: '-',
        bestMo3: '-',
        bestAo5: '-',
        bestAo12: '-',
        bestAo100: '-',

        selectedCube: '3x3',

        showAds: true,
        isPro: true,

        inspection: false,
    };
  }

  componentDidMount = async() => {
    this.getSolves();
    // IAP.getProducts(productIds).then((res) => {
    //   console.warn(res);
    // });
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

  setInspection = (inspection) => {
    this.setState({inspection: inspection})
  }

  secToMin = (seconds) =>{
    var result = '';
    if(seconds > 60){
        var minutes =  seconds / 60;
        var minutesOnly = Math.floor(minutes);
        var seconds = ((minutes % 1) * 60).toFixed(2);
        if(seconds < 10){result = `${minutesOnly}:0${seconds}`}
        else{result = `${minutesOnly}:${seconds}`}
    }
    else{
        result = seconds
    }
    
    return result;
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
        var lastSolveTime = lastSolve['time'];
        if(lastSolve['isPlus2'] == true){lastSolveTime = (Number(lastSolveTime) +2).toFixed(2);}
        else{if(lastSolve['isDNF'] == true){lastSolveTime = 'DNF'}}
        this.setState({currentSolve: lastSolveTime, mo3: lastSolve['mo3'], ao5: lastSolve['ao5'], ao12: lastSolve['ao12'], ao100: lastSolve['ao100']})
    

        //get best averages
        var times = [];
        var mo3s = [];
        var ao5s = [];
        var ao12s = [];
        var ao100s = [];

        var minMo3 = '-';
        var minAo5 = '-';
        var minAo12 = '-';
        var minAo100 = '-';

        solves.forEach(element => {
            if(element['isPlus2'] == true){times.push(Number(element['timeInSeconds']) + 2);}
            else{if(element['isDNF'] != true){times.push(Number(element['timeInSeconds']));}}
            if (solves.length >= 3)
            {
              if (Number(element['mo3InSeconds']) != 0 && element['mo3'] != 'DNF'){
                mo3s.push(Number(element['mo3InSeconds']));
              } 
            }
            if (solves.length >= 5)
            {
              if (!Number(element['ao5InSeconds']) == 0 && element['ao5'] != 'DNF'){
                  ao5s.push(Number(element['ao5InSeconds']));
              } 
            }
            
            if (solves.length >= 12)
            {
              if (! Number(element['ao12InSeconds']) == 0 && element['ao12'] != 'DNF'){
                  ao12s.push(Number(element['ao12InSeconds']));
              } 
            }

            if (solves.length >= 100)
            {
              if (! Number(element['ao100InSeconds']) == 0 && element['ao100'] != 'DNF'){
                  ao100s.push(Number(element['ao100InSeconds']));
              }
            }
            
            
        });
        var minTime = Math.min(...times).toFixed(2);
        if(minTime>60){minTime = this.secToMin(minTime)}

        if (solves.length >= 3)
        {
          if(mo3s.length == 0){
            minMo3 = 'DNF'
          }
          else {
            minMo3 =  Math.min(...mo3s).toFixed(2);
            if(minMo3>60){minMo3 = this.secToMin(minMo3)}
          }

          if (solves.length >= 5)
          {
            if(ao5s.length == 0){
              minAo5 = 'DNF'
            }
            else {
              minAo5 =  Math.min(...ao5s).toFixed(2);
              if(minAo5>60){minAo5 = this.secToMin(minAo5)}
            }

            if (solves.length >= 12)
            {
              if(ao12s.length == 0){
                minAo12 = 'DNF'
              }
              else {
                minAo12 = Math.min(...ao12s).toFixed(2);
                if(minAo12>60){minAo12 = this.secToMin(minAo12)}
              }
            }

            if (solves.length >= 100)
              {
                if(ao100s.length == 0){
                  minAo100 = 'DNF'
                }
                else {
                  minAo100 = Math.min(...ao100s).toFixed(2);
                  if(minAo100>60){minAo100 = this.secToMin(minAo100)}
                }
              }
          }
        }

        this.setState({bestSolve: minTime, bestMo3: minMo3, bestAo5: minAo5, bestAo12: minAo12, bestAo100: minAo100})
    }
    else{this.setState({currentSolve: '-', mo3: '-', ao5: '-', ao12: '-', ao100: '-', bestSolve: '-', bestMo3: '-', bestAo5: '-', bestAo12: '-', bestAo100: '-'})}
    }
  }

  proPopup = () => {
    Alert.alert(
      "Upgrade to Kyuubi Pro",
      "Unlock Themes, Sessions and Remove Ads.",
      [
        {
          text: "No",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
          },
          { text: "Yes"},
      ]
  );
  }

  
  render(){
    return(
      <MyContext.Provider value={{...this.state, setSolves: this.setSolves, getSolves: this.getSolves, setSolvesCount: this.setSolvesCount, displayAverages: this.displayAverages, setSelectedCube: this.setSelectedCube, setInspection: this.setInspection}}>
        <Provider store={store}>
          <NavigationApp/>
        </Provider>
      </MyContext.Provider>
    ) 
  }
}
