import React, { Component } from "react";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import withStyles from "@material-ui/core/styles/withStyles";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import NotesIcon from "@material-ui/icons/Notes";
// import Avatar from "@material-ui/core/avatar";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import CircularProgress from "@material-ui/core/CircularProgress";
import axios from "axios";

import Profile from "../profile/profile";
import Todo from "../todo/todo";

const drawerWidth = 240;

const styles = (theme: any) => ({
  root: {
    display: "flex",
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  avatar: {
    height: 110,
    width: 100,
    flexShrink: 0,
    flexGrow: 0,
    marginTop: 20,
  },
  uiProgess: {
    position: "fixed",
    zIndex: "1000",
    height: "31px",
    width: "31px",
    left: "45%",
    top: "35%",
  },
  toolbar: theme.mixins.toolbar,
});

class home extends Component {
  state = {
    render: false,
    firstName: "",
    lastName: "",
    profilePicture: "",
    uiLoading: true,
    imageLoading: false,
  };

  loadAccountPage = () => {
    this.setState({ render: true });
  };

  loadTodoPage = () => {
    this.setState({ render: false });
  };

  logoutHandler = () => {
    localStorage.removeItem("AuthToken");
    // @ts-ignore
    this.props.history.push("/login");
  };

  componentWillMount = () => {
    const authToken = localStorage.getItem("AuthToken");
    axios.defaults.headers.common = { Authorization: `${authToken}` };
    axios
      .get("/user")
      .then((response) => {
        console.log(response.data);
        this.setState({
          firstName: response.data.userCredentials.firstName,
          lastName: response.data.userCredentials.lastName,
          email: response.data.userCredentials.email,
          phoneNumber: response.data.userCredentials.phoneNumber,
          country: response.data.userCredentials.country,
          username: response.data.userCredentials.username,
          uiLoading: false,
          profilePicture: response.data.userCredentials.imageUrl,
        });
      })
      .catch((error) => {
        if (error.response.status === 403) {
          // @ts-ignore
          this.props.history.push("/login");
        }
        console.log(error);
        this.setState({ errorMsg: "Error in retrieving the data" });
      });
  };

  render() {
    // @ts-ignore
    const { classes } = this.props;
    if (this.state.uiLoading === true) {
      return (
        <div className={classes.root}>
          {this.state.uiLoading && (
            <CircularProgress size={150} className={classes.uiProgess} />
          )}
        </div>
      );
    } else {
      return (
        <div className={classes.root}>
          <CssBaseline />
          <AppBar position="fixed" className={classes.appBar}>
            <Toolbar>
              <Typography variant="h6" noWrap>
                TodoApp
              </Typography>
            </Toolbar>
          </AppBar>
          <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            <div className={classes.toolbar} />
            <Divider />
            {/* <center> */}
            {/* <Avatar
              src={this.state.profilePicture}
              className={classes.avatar}
            /> */}
            <p>
              {" "}
              {this.state.firstName} {this.state.lastName}
            </p>
            {/* </center> */}
            <Divider />
            <List>
              <ListItem button key="Todo" onClick={this.loadTodoPage}>
                <ListItemIcon>
                  {" "}
                  <NotesIcon />{" "}
                </ListItemIcon>
                <ListItemText primary="Todo" />
              </ListItem>

              <ListItem button key="Account" onClick={this.loadAccountPage}>
                <ListItemIcon>
                  {" "}
                  <AccountBoxIcon />{" "}
                </ListItemIcon>
                <ListItemText primary="Account" />
              </ListItem>

              <ListItem button key="Logout" onClick={this.logoutHandler}>
                <ListItemIcon>
                  {" "}
                  <ExitToAppIcon />{" "}
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </List>
          </Drawer>

          <div>{this.state.render ? <Profile /> : <Todo />}</div>
        </div>
      );
    }
  }
}

// @ts-ignore
export default withStyles(styles)(home);
