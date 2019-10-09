import React, {Component} from 'react'
import PropTypes from 'prop-types'
// import withTheme from '@material-ui/core/styles/withTheme';
import {PieChart, Pie, Cell, ResponsiveContainer} from 'recharts'
import deepOrange from '@material-ui/core/colors/deepOrange'

class WorkedTimeChart extends Component {
  render = () => {
    const {
      // theme,
      workedTime,
      timeToWork,
    } = this.props

    const data = [
      {name: `Trabalhadas`, value: workedTime},
      {name: `A trabalhar`, value: timeToWork},
    ]

    // const primaryColor = theme.palette.primary
    const primaryColor = deepOrange

    return (
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={25}
            outerRadius={40}
            paddingAngle={1}
          >
            <Cell fill={primaryColor[500]} />
            <Cell fill={primaryColor[100]} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    )
  }
}

WorkedTimeChart.propTypes = {
  // theme: PropTypes.object.isRequired,
  workedTime: PropTypes.number.isRequired,
  timeToWork: PropTypes.number.isRequired,
}

export default WorkedTimeChart
