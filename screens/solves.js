import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Button, Image, Switch, TargetComponent } from 'react-native';
import  AsyncStorage  from "@react-native-async-storage/async-storage";
import { ScrollView } from 'react-native-gesture-handler';

export default class SettingsScreen extends Component{
    constructor(props){
        super(props);

        this.state = {
            solves: [],
        };
    }

    componentDidMount = async () => {
        var solves = await AsyncStorage.getItem('solves');
        if (solves != null){
            solves = JSON.parse(solves);
            solves = solves['solves'];
            this.setState({solves: solves});
        }
    }

    lapsList() {

        if(this.state.solves.length > 0){
            return this.state.solves.reverse().map((data) => {
                return (
                  <View style={styles.times}><Text>{data.time}</Text></View>
                )
              })
        }
    
    }


    render(){
        const { navigate } = this.props.navigation;
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView>
                    <View style={styles.timesContainer}>
                        {this.lapsList()}
                    </View>
                </ScrollView>
                
                <View style={styles.pageNavigator}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('SettingsScreen')}>
                        <Image style={styles.pagesButton} source={require('../assets/settings.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen', {isTimerDisabled: this.state.isTimerDisabled})}>
                        <Image style={styles.pagesButton} source={require('../assets/home.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity>
                    <Image style={styles.pagesButton} source={require('../assets/graph.png')}/>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'gray',
        alignItems: 'center',
        width: "100%",
        justifyContent: "space-between"
    },
    pageNavigator: {
        position: 'absolute',
        bottom: 50,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 60,
        width: 250,
        backgroundColor: 'dodgerblue' 
    },
    pagesButton: {
        width: 25,
        height: 25,
    },
    times: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'dodgerblue',
        width: 80,
        padding: 10,
        borderRadius: 60,
        margin: 10,
    },
    timesContainer: {
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingBottom: 80,
    },
    
});