import React, { Component } from 'react';
import { Easing, Animated } from 'react-native';
import { StackNavigator } from 'react-navigation'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';
import HomeScreen from './screens/home';
import SettingsScreen from './screens/settings';
import SolvesScreen from './screens/solves';

import { Provider } from 'react-redux'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'
import themeReducer from './redux/themeReducer'

const store = createStore(
  combineReducers({ themeReducer }),
  applyMiddleware(thunk)
)


const screens = {
  HomeScreen: {
    screen: HomeScreen,
      navigationOptions: {
        headerShown: false,
        gestureEnabled: false,
      },
  },
  SettingsScreen: {
    screen: SettingsScreen,
      navigationOptions: {
        headerShown: false,
        gestureDirection: 'horizontal-inverted',
        gestureEnabled: false,
      },
  },
  SolvesScreen: {
    screen: SolvesScreen,
      navigationOptions: {
        headerShown: false,
        gestureEnabled: false,
      },
  },
}

const HomeStack = createStackNavigator(screens);
HomeStack.navigationOptions={navigationOptions: {headerShown:false}};
const NavigationApp = createAppContainer(HomeStack);

export default class App extends Component {
  
  render(){
    return(
      <Provider store={store}>
        <NavigationApp/>
      </Provider>
      
    ) 
  }
}
