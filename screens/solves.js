import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import {Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Button, Image, Switch, TargetComponent } from 'react-native';
import  AsyncStorage  from "@react-native-async-storage/async-storage";
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import moment from 'moment';
import {Picker} from '@react-native-picker/picker';

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
            selectedValue: 'date',

            primaryColor: '#303030',
            accentColor: '#007fff',

            solvesCount: 0,
        };
    }

    setModalVisible = async (visible, index) => {
        this.setState({ modalVisible: visible });

        if (visible)
        {
            // set solve data
           var solves = this.state.solves;
           var solve = solves[index];
           this.setState({modalTime: solve['time'], modalDate: solve['date'], modalScramble: solve['scramble'],  modalCubeType: solve['cubeType'],currentSolveIndex: index,});
    
        }
    }
    componentDidMount = async () => {

        var solves = await AsyncStorage.getItem('solves');
        if (solves != null){
            solves = JSON.parse(solves);
            solves = solves['solves'];

            //filter solves with cube type
            var cubeType = await AsyncStorage.getItem('selectedCube');
            var filteredArray = []

            solves.forEach(solve => {
                if (solve['cubeType'] == cubeType){filteredArray.push(solve)}
            });

            var solvesCount = filteredArray.length;

            filteredArray.reverse();
            this.setState({solves: filteredArray, solvesCount: solvesCount});
        }
        var filterItem = await AsyncStorage.getItem('filterItem');


        if (filterItem != null){
            this.setState({selectedValue: filterItem});
            this.setSelectedValue(filterItem);
        }
        
    }

    deleteSolve = async (index) => {
        let itemsCopy = this.state.solves;
        var solveToDelete = itemsCopy[index];
        itemsCopy.splice(index, 1);


        // change solves counter
        var solvesCount = this.state.solvesCount;
        solvesCount -= 1;

        this.setState({solves: itemsCopy, solvesCount: solvesCount});

        var solves = await AsyncStorage.getItem('solves');
        solves = JSON.parse(solves);
        solves = solves['solves'];

        var newSolves = []
        solves.forEach(solve => {
            // if the solve doesn't match to solveToDelete add it to the new Array
            if(!(solve['time'] == solveToDelete['time'] && solve['date'] == solveToDelete['date']))
            {
                newSolves.push(solve);
            }
        });

        var solvesToSave = {solves: newSolves};
        await AsyncStorage.setItem('solves', JSON.stringify(solvesToSave));

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

    setSelectedValue = async (itemValue) => {
        this.setState({selectedValue: itemValue})
        await AsyncStorage.setItem('filterItem', itemValue);

        if (itemValue == 'time')
        {
            var filteredArray = this.state.solves.sort((a, b) => parseFloat(a.time) - parseFloat(b.time))
            
            this.setState({solves: filteredArray})
        }
        else if (itemValue == 'date')
        {
            var solves = await AsyncStorage.getItem('solves');
            if (solves != null){
                solves = JSON.parse(solves);
                solves = solves['solves'];

                //filter solves with cube type
                var cubeType = await AsyncStorage.getItem('selectedCube');
                var filteredArray = []

                solves.forEach(solve => {
                    if (solve['cubeType'] == cubeType){filteredArray.push(solve)}
                });

                filteredArray.reverse();
                this.setState({solves: filteredArray});
            }
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
            this.setModalVisible(!modalVisible);
          }}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => this.setModalVisible(!modalVisible)} style={{flex: 1,justifyContent: 'center',alignItems: 'center'}}>
          <TouchableOpacity activeOpacity={1} style={{width: 375, height: 200}}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalScrambleText}>{this.state.modalTime}</Text>
              <Text style={styles.modalText}>{this.state.modalCubeType}</Text>
              <Text style={styles.modalText}>{this.state.modalScramble}</Text>
              <Text style={styles.modalText}>{this.state.modalDate}</Text>
                <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => this.deleteSolve(this.state.currentSolveIndex)}
              >
                <Text style={styles.textStyle}>Delete</Text>
              </Pressable>
            </View>
          </View>
          </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

                <Picker
                itemStyle={{height: 44}}
                    selectedValue={this.state.selectedValue}
                    style={styles.filter}
                    onValueChange={(itemValue, itemIndex) => this.setSelectedValue(itemValue)}
                >
                    <Picker.Item label="Date" value="date" />
                    <Picker.Item label="Time" value="time" />
                </Picker>

                <View>
                    <Text style={styles.solvesCount}>{this.state.solvesCount} Solves</Text>
                </View>

                <ScrollView>
                    <View style={styles.timesContainer}>
                        {this.lapsList()}
                    </View>
                </ScrollView>
                
                <View style={styles.pageNavigator}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('SettingsScreen')}>
                        <Image style={styles.pagesButton} source={require('../assets/settings.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
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
        backgroundColor: '#303030',
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
        backgroundColor: '#007fff' 
    },
    pagesButton: {
        width: 25,
        height: 25,
    },
    times: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007fff',
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
        backgroundColor: "#303030",
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
        backgroundColor: '#007fff',
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        color: 'white'
    },
    modalScrambleText: {
        fontSize: 35,
        color: '#007fff',
        marginBottom: 15,
        textAlign: "center"
    },
    filter: {
        backgroundColor: '#007fff',
        borderRadius: 10,
        marginBottom: 8,
        width: '80%',
    },
    solvesCount: {
        color: 'white'
    },
    
});