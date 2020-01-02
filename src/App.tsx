import * as React from "react";
import { connect, useDispatch } from "react-redux";
import { useEffect } from "react";

const App = props => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch({ type: "action/first", systemCallId: 1, timer: 1500 }); // ignored
    dispatch({ type: "action/first", systemCallId: 2, timer: 2500 }); // accepted

    dispatch({ type: "action/second", systemCallId: 1, timer: 1500 }); // accepted
    dispatch({ type: "action/second", systemCallId: 2, timer: 2500 }); // accepted

    dispatch({ type: "action/third", systemCallId: 1, timer: 3500 }); // accepted
    dispatch({ type: "action/third", systemCallId: 2, timer: 2500 }); // accepted, waits for previous
    dispatch({ type: "action/third", systemCallId: 3, timer: 1500 }); // accepted, waits for previous

    dispatch({ type: "action/fourth", systemCallId: 1, timer: 1500 }); // accepted
    dispatch({ type: "action/fourth", systemCallId: 3, timer: 3500 }); // ignored
    dispatch({ type: "action/fourth", systemCallId: 2, timer: 2500 }); // ignored
    setTimeout(() => {
      dispatch({ type: "action/fourth", systemCallId: 4, timer: 2500 }); // accepted
    }, 1550);
  }, []);
  return <div>redux-observable</div>;
};

const mapStateToProps = state => {
  return {
    products: state.productState.products
  };
};

export default connect(mapStateToProps)(App);
