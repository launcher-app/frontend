import React, {Component} from 'react'
import PropTypes from 'prop-types'
import withTheme from '@material-ui/core/styles/withTheme';
import {PieChart, Pie, Cell, ResponsiveContainer} from 'recharts'

class WorkedTimeChart extends Component {
  render = () => {
    const {
      theme,
      workedTime,
      timeToWork,
    } = this.props

    const data = [
      {name: `Trabalhadas`, value: workedTime},
      {name: `A trabalhar`, value: timeToWork},
    ]

    const primaryColor = theme.palette.primary

    return (
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={30}
            outerRadius={40}
            paddingAngle={5}
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
  theme: PropTypes.object.isRequired,
  workedTime: PropTypes.number.isRequired,
  timeToWork: PropTypes.number.isRequired,
}

export default withTheme()(WorkedTimeChart)
