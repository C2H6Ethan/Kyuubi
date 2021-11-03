import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Button, Image, Switch, TargetComponent } from 'react-native';
import  AsyncStorage  from "@react-native-async-storage/async-storage";
import { ScrollView } from 'react-native-gesture-handler';
import moment from 'moment';

export default class SettingsScreen extends Component{
    constructor(props){
        super(props);

        this.state = {
            solves: [],
            modalVisible: false,
            modalTime: null,
            modalDate: null,
            modalScramble: null,
            currentSolveIndex: null,
        };
    }

    setModalVisible = async (visible, index) => {
        this.setState({ modalVisible: visible });

        if (visible)
        {
            // set solve data
            var solves = await AsyncStorage.getItem('solves');
            solves = JSON.parse(solves);
            solves = solves ['solves'];
            var newIndex = (solves.length - 1) - index;
            var solve = solves[newIndex];
            this.setState({modalTime: solve['time'], modalDate: solve['date'], modalScramble: solve['scramble'], currentSolveIndex: index,});
        }
    }

    componentDidMount = async () => {
        var solves = await AsyncStorage.getItem('solves');
        if (solves != null){
            solves = JSON.parse(solves);
            solves = solves['solves'];
            solves.reverse();
            this.setState({solves: solves});
        }
    }

    deleteSolve = async (index) => {
        let itemsCopy = this.state.solves;
        itemsCopy.splice(index, 1);
        this.setState({solves: itemsCopy});

        var solves = await AsyncStorage.getItem('solves');
        solves = JSON.parse(solves);
        solves = solves ['solves'];
        var newIndex = (solves.length - 1) - index;
        solves.splice(newIndex, 1);
        var newSolves = {solves: solves};
        await AsyncStorage.setItem('solves', JSON.stringify(newSolves));

        this.setModalVisible(false, null);
    }

    lapsList() {

        if(this.state.solves.length > 0){
            return this.state.solves.map((data, index) => {
                return (
                    <TouchableOpacity key={index} style={styles.times} onPress={() => this.setModalVisible(true, index)}>
                      <Text>{data.time}</Text> 
                    </TouchableOpacity>
                )
              })
        }
    
    }


    render(){
        const { navigate } = this.props.navigation;
        const { modalVisible } = this.state;
        return (
            <SafeAreaView style={styles.container}>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            this.setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>{this.state.modalTime}</Text>
              <Text style={styles.modalText}>{this.state.modalScramble}</Text>
              <Text style={styles.modalText}>{this.state.modalDate}</Text>
              <View style={styles.modalButtonsContainer}>
                <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={() => this.setModalVisible(!modalVisible, null)}
                >
                    <Text style={styles.textStyle}>Hide</Text>
                </Pressable>
                <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => this.deleteSolve(this.state.currentSolveIndex)}
              >
                <Text style={styles.textStyle}>Delete</Text>
              </Pressable>
              </View>
            </View>
          </View>
        </Modal>

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
                    <Image style={styles.pagesButtonClicked} source={require('../assets/graph.png')}/>
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
        justifyContent: 'center',
        paddingHorizontal: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingBottom: 80,
    },
    pagesButtonClicked: {
        width: 35,
        height: 35,
    },


    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalButtonsContainer: {
        width: '50%',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    buttonClose: {
        backgroundColor: "dodgerblue",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    }
    
});