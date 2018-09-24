import React, { Component } from 'react';
import Beforeunload from 'react-beforeunload';
import localStorage from 'local-storage';

import styles from './css/style.css';
import { Container, Row, Col, Button, Dropdown, DropdownButton, Card} from 'react-bootstrap';

function Cond(props){
	var display = props.children;
	if(!props.iff) display="";
	return display;
}

class LoginForm extends Component{
	constructor(props){
		super(props);
		this.state={
			value: ""
		};
		this.handleChange=this.handleChange.bind(this);
		this.resetText=this.resetText.bind(this);
	}

	handleChange(event){
		this.setState({
			value: event.target.value
		});
	}

	resetText(event){
		if(this.props.loggedIn)
			this.setState({
				value: this.props.user
			});
	}

	render(){
		return (<div className={styles.login}><form onSubmit={event => this.props.login(event, this.state.value)}> <label> Username: {" "} 
			<input type="text" value={this.state.value} name="username" onBlur={this.resetText}
					onChange={this.handleChange} placeholder="your username"/> 
			</label>
			</form></div>);
	}
}

class UserPicker extends Component{
	constructor(props){
		super(props);
		this.state={};
		this.handleChange=this.handleChange.bind(this);
	}

	handleChange(ind, event){
		event.preventDefault();
		var friend = this.props.users[ind];
		this.props.chooseUser(friend,true);
	}

	render(){
		return (<div className={styles.picker} > 
			<div>Start a Conversation:{"   "}</div>
			<DropdownButton style={{'marginLeft': "10px"}} id="user" value={0} title="Select a user...">
  			{this.props.users.map((name,index) => 
  				<Dropdown.Item key={name} eventKey={index} onSelect={this.handleChange}>
  				{index+1}. {name}</Dropdown.Item>)}
 			</DropdownButton></div>);
	}
}

class ChatModule extends Component{
	constructor(props){
		super(props);
		var len =0, len2=0;
		if(props.chat)
			len = props.chat.length;
		if(props.pending)
			len2 = props.pending.length;
		this.state={
			value: "",
			start: Math.max(len-20,0),
			chatsize: len,
			pendingsize: len2,
			hasMounted: false
		};
		this.handleChange=this.handleChange.bind(this);
		this.handleSend=this.handleSend.bind(this);
		this.loadMore=this.loadMore.bind(this);
		this.chatbottom=null;
	}

	handleChange(event){
		this.setState({
			value: event.target.value
		});
	}

	loadMore(event){
		this.setState(function(prev){
			return {start: Math.max(prev.start-20,0)};
		});
	}

	handleSend(event){
		event.preventDefault();
		var message=this.state.value;
		if(message=="") return;
		this.props.sendMessage(message, this.props.user);
		this.setState({
			value: ""
		});
	}

	componentDidMount(){
		if(this.props.textref[1])
	    	this.props.textref[0].current.focus();
	    this.chatbottom.scrollIntoView({ behavior: "instant" });
	    this.setState({hasMounted: true});
	}

	componentDidUpdate(){
		if(this.state.hasMounted){
			if (this.props.chat && this.state.chatsize<this.props.chat.length){
				this.setState({chatsize: this.props.chat.length});
				this.chatbottom.scrollIntoView({ behavior: "auto" });
			}
			if(this.props.pending && this.state.pendingsize<this.props.pending.length){
				this.setState({pendingsize: this.props.pending.length});
				this.chatbottom.scrollIntoView({ behavior: "auto" });
			}
		}
	}

	render(){
		var displayed= [], pending=[];
		var props=this.props;
		if(props.chat)
			displayed=props.chat.slice(this.state.start, props.chat.length);
		if(props.pending)
			pending=props.pending;

		
		return (<Card style={{ 'width': '18rem', 'marginRight': '20px' }}><Card.Header><h3>{this.props.user} </h3>
				<Button className={styles.close} onClick={(event)=>props.closeChat(props.user)}> X </Button></Card.Header>
					<div className={styles.chat}>
					<Cond iff={this.state.start>0}><div className={styles.center}><Button className={styles.load} onClick={this.loadMore}> Load More... </Button></div></Cond>
					{displayed.map(function(msg){
						var from= msg.from;
						if(from==props.user)
							from=<i>{from}</i>
						var key=String(msg.date)+"~~"+String(msg.message)+"~~"+String(msg.from);
						return <div key={key} style={{display: 'flex'}}> <div style={{marginRight: '8px', marginLeft: '2px'}}><b>{from}:</b></div> <div>{msg.message}</div></div>;
					})}
					{pending.map(function(msg){
						var key=String(msg.date)+"~~"+String(msg.message)+"~~"+String(props.user);
						return <div key={key} style={{display: 'flex'}}> <div style={{marginRight: '8px',marginLeft: '2px'}}><b>{props.myname} (sending):</b></div> <div>{msg.message}</div></div>;
					})}
					 <div ref={(el) => { this.chatbottom = el; }} />
					</div>
					<form onSubmit={this.handleSend}>
						<input type="text" className={styles.sendbox} value={this.state.value} name="message" ref={props.textref[0]}
							onChange={this.handleChange} placeholder="your message"/> 
					</form>
				</Card>);
	}
}

class Notification extends Component{
	constructor(props) {
	    super(props);
	    this.state = {
	    	timer: props.lifetime,
	    	timerID: null,
	    	ID: String(props.timestamp)+"~~"+String(props.note),
	    	on: false
	    };
	    this.tick=this.tick.bind(this);
	    this.onMouseEnter=this.onMouseEnter.bind(this);
	    this.onMouseLeave=this.onMouseLeave.bind(this);
	}

	tick(){
		this.setState(function(prev){
			if(prev.on) return {};
			return {timer: prev.timer-1};
		});
		if(this.state.timer<=0)
			this.props.end(this.state.ID);
	}

	componentWillUnmount(){
		clearInterval(this.state.timerID);
	}

	componentDidMount(){
		this.setState({timerID: setInterval(this.tick, 1)});
	}

	onMouseEnter(){
		var app =this;
		app.setState(function(prev){
			return {timer: app.props.lifetime, on: true}; 
		});
	}

	onMouseLeave(){
		var app =this;
		app.setState(function(prev){
			return {on: false}; 
		});
	}

	render(){
		var opacity= Math.min(this.state.timer, 120.0)/200.0;
		if(this.state.on) opacity=0.8;
		return <a onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
			<Container className={styles.notification} style={{opacity: opacity}}>
				<div className={styles.middle}/>
				<div style={{display: 'flex'}}><Button style={{marginRight: "8px"}} size="sm" className={styles.close2}
				onClick={(event)=> this.props.end(this.state.ID)}> X </Button>
			<div>{this.props.note}</div></div>
			<div className={styles.middle}/>
			</Container></a>;
	}
}

class App extends Component{
	constructor(props){
		super(props);
		this.state={
			chats: {},
			outBox: {},
			myName: "",
			activeUsers: [],
			openChats: [],
			loggedIn: false,
			notifs: [],
			refs: {},
			tabs: {}
		};
		this.login=this.login.bind(this);
		this.addNewUser=this.addNewUser.bind(this);
		this.addCurrUser=this.addCurrUser.bind(this);
		this.chooseUser=this.chooseUser.bind(this);
		this.closeChat=this.closeChat.bind(this);
		this.sendMessage=this.sendMessage.bind(this);
		this.updateMessages=this.updateMessages.bind(this);
		this.logout=this.logout.bind(this);
		this.rmvUser=this.rmvUser.bind(this);
		this.rmvNotif=this.rmvNotif.bind(this);
	}

	componentDidMount(){
		console.log(location);
		this.props.socket.on('login response', this.addNewUser);
		this.props.socket.on('welcome response', this.addCurrUser);
		this.props.socket.on('recieve message', this.updateMessages);
		this.props.socket.on('logout response', this.rmvUser);
	}

	addCurrUser(msg){
		if(msg.to != this.state.myName || !this.state.loggedIn) return;
		this.setState(function(prev){
			if(!(msg.from in prev.tabs)){
				prev.activeUsers.push(msg.from);
				prev.tabs[msg.from]=1;
				if(msg.chat) prev.chats[msg.from]=msg.chat;
			} else prev.tabs[msg.from]+=1;
			return {activeUsers: prev.activeUsers, chats: prev.chats, tabs: prev.tabs};
		});
	}

	rmvUser(msg){
		var olduser = msg.username;
		if(olduser == this.state.myName || !this.state.loggedIn) return;
		this.setState(function(prev){
			prev.tabs[olduser]-=1;
			if(prev.tabs[olduser]==0){
				var index = prev.activeUsers.indexOf(olduser);
				delete prev.tabs[olduser];
				prev.activeUsers.splice(index,1);
				prev.notifs.push([olduser+ " has logged out", 700, new Date()]);
				return {activeUsers: prev.activeUsers, tabs: prev.tabs, notifs: prev.notifs};
			} else return {tabs: prev.tabs};
		});
		if((olduser in this.state.refs) && !(olduser in this.state.tabs))
			this.closeChat(olduser);
	}

	updateMessages(msg){
		var user=this.state.myName;
		var ab = [msg.from, msg.to].sort();
		var key= String(ab[0].length)+","+String(ab[1].length)+"|"+ab[0]+","+ab[1];

		if((msg.to != user  && msg.from != user) || !this.state.loggedIn) return;
		if(msg.to == user) this.chooseUser(msg.from, false);
		if(msg.from == user) this.chooseUser(msg.to, true);
		this.setState(function(prev){
			if(user==msg.to){
				if(msg.from in prev.chats)
					prev.chats[msg.from].push({from: msg.from, message: msg.message, date: msg.date});
				else prev.chats[msg.from]= [{from: msg.from, message: msg.message, date: msg.date}];
				var audio = new Audio("/static/ping.wav");
    			audio.play();
				localStorage.set(key, {chat : this.state.chats[msg.from]});
			} else {
				var outIndex=-1;
				if(msg.to in prev.outBox)
					outIndex= prev.outBox[msg.to].map(a=>JSON.stringify(a)).indexOf(JSON.stringify({message: msg.message, date: msg.date}));
				if(outIndex>-1) prev.outBox[msg.to].splice(outIndex,1);
				if(msg.to in prev.chats)
					prev.chats[msg.to].push({from: user, message: msg.message, date: msg.date});
				else prev.chats[msg.to]= [{from: user, message: msg.message, date: msg.date}];

				localStorage.set(key, {chat : this.state.chats[msg.to]});
			}
			return {chats: prev.chats, outBox: prev.outBox};
		});

	}

	addNewUser(msg){
		var app=this;
		var newuser = msg.username, name = app.state.myName;
		var ab = [newuser, name].sort();
		var key= String(ab[0].length)+","+String(ab[1].length)+"|"+ab[0]+","+ab[1];

		if(newuser == name){
			app.setState(function(prev){
				if(prev.loggedIn){
					prev.notifs.push(["You have logged in on another tab", 700, new Date()]);
					return {notifs: prev.notifs};
				}
				return {loggedIn: true};
			});
		} else if(app.state.loggedIn) {
			app.setState(function(prev){
				if(!(newuser in prev.tabs)){
					var backup = localStorage.get(key);
					if(backup) prev.chats[newuser]=backup.chat;
					prev.tabs[newuser]=1;
					prev.activeUsers.push(newuser);
					prev.notifs.push([newuser+ " has logged in", 700, new Date()]);
				} else prev.tabs[newuser]+=1;
				return {activeUsers: prev.activeUsers,
					notifs: prev.notifs, tabs: prev.tabs};
			});
			app.props.socket.emit('welcome', 
				{to: newuser, from: name, chat: app.state.chats[newuser]});
		}
	}

	chooseUser(friend, mine){
		this.setState(function(prev){
			if(prev.openChats.indexOf(friend)==-1){
				prev.refs[friend]=[React.createRef(),mine];
				prev.openChats.push(friend);
			} else if(mine){
				prev.refs[friend][0].current.focus();
			}
			return {openChats: prev.openChats, refs: prev.refs};
		});
	}

	closeChat(name){
		this.setState(function(prev){
			var index = prev.openChats.indexOf(name);
			prev.openChats.splice(index,1);
			delete prev.refs[name];
			return {openChats: prev.openChats, refs: prev.refs};
		});
	}

	logout(event){
		if(!this.state.loggedIn) return;
		var user=this.state.myName;
		this.setState({
			chats: {},
			outBox: {},
			activeUsers: [],
			openChats: [],
			loggedIn: false,
			notifs: [],
			refs: {},
			tabs: {}
		});
		this.props.socket.emit('logout', {username: user});
	}

	login(event, username){
		event.preventDefault();
		var curruser=this.state.myName;
		if(curruser!=username){
			this.logout(event);
			this.setState({myName: username});
			if(username!="")
				this.props.socket.emit('login', {username: username});
		}
	}

	sendMessage(message, recipient){
		var user=this.state.myName;
		var now = new Date()
		this.setState(function(prev){
			if(recipient in prev.outBox)
				prev.outBox[recipient].push({message: message, date: now});
			else
				prev.outBox[recipient]= [{message: message, date: now}];
			return {outBox: prev.outBox};
		});
		this.props.socket.emit('send message', {to: recipient, from: user, message: message, date: now});
	}

	rmvNotif(noteID){
		this.setState(function(prev){
			var index = prev.notifs.map(a=>(String(a[2])+"~~"+String(a[0]))).indexOf(noteID);
			prev.notifs.splice(index,1);
			return {notifs: prev.notifs};
		});
	}

	render(){
		var user=this.state.myName;
		return (<Beforeunload onBeforeunload={this.logout}><div>
					<Cond iff={this.state.loggedIn}><h2> Welcome, {user}!</h2></Cond>
					<p>Location object {JSON.stringify(location)}; {JSON.stringify(Location)} </p>
					<Container className={styles.header}><Row>
						<Col md={7}><LoginForm login={this.login} user={user} loggedIn={this.state.loggedIn}/>
						</Col>
						<Col><Cond iff={this.state.loggedIn}>
							<UserPicker users={this.state.activeUsers} chooseUser={this.chooseUser}/>
						</Cond></Col>
					</Row></Container>
					<div className={styles.overlay}>
						{this.state.notifs.map(note => 
							<Notification key={String(note[2])+"~~"+String(note[0])} timestamp={note[2]} note={note[0]}
								lifetime={note[1]} end={this.rmvNotif}/>)}
					</div>
					<Cond iff={this.state.loggedIn}>
						<div className={styles.chatDisplay}>{this.state.openChats.map((name) => 
							<div key={name}><ChatModule user={name} chat={this.state.chats[name]} myname={user}
								textref={this.state.refs[name]} closeChat={this.closeChat}
								sendMessage={this.sendMessage} pending={this.state.outBox[name]}/></div>)}
						</div>
					</Cond>

				</div></Beforeunload>);
	}
}


export default App;
