import * as React from 'react'
import { Loading } from 'common/loading'

import {
  StageTasksMap,
  GanttStageSchema,
  GanttTasklistSchema,
  TasksExpanded,
} from '../gantt.module'
import { TaskSchema } from 'teambition-sdk'
import { TaskId, StageId } from 'teambition-types'

import { GanttMenuStageItemComponent as StageItem } from '../gantt-menu-stage-item'

import './gantt-menu.style.less'

interface GanttMenuProps {
  readonly isLoading: boolean
  readonly stages: GanttStageSchema[] | null
  readonly stageTasksMap: StageTasksMap
  readonly tasklist: GanttTasklistSchema | null
  readonly tasksExpanded: TasksExpanded
  readonly isUsingFilter: boolean

  onRequestTasks: (stage: GanttStageSchema) => void
  onExpandStage: (stage: GanttStageSchema) => void
  onUnexpandStage: (stage: GanttStageSchema) => void
  onRequestMoreTasks: (stageId: StageId, pageIndex: number) => void
  onOpenTaskDetail: (task: TaskSchema, type: string) => void
  onOpenTaskCreator: (stage: GanttStageSchema, onComplete?: () => void) => void
  onChangeCurrentTask: (taskId: TaskId | null, stageId: StageId) => void
  onRequestSubtasks: (stageId: StageId, taskId: TaskId) => void
}

const a = <Loading />

export class GanttMenuComponent extends React.PureComponent<GanttMenuProps> {
  private stagesRef = new Map<StageId, StageItem>()
  private saveStageRef = (ref: StageItem) => {
    const stageId = ref && ref.props.stage._id && this.props.onExpandStage
    stageId && this.stagesRef.set(stageId, ref)
  }

  forceUpdateTask = (taskId: TaskId | null, stageId: StageId) => {
    this.stagesRef.forEach((ref) => {
      ref && ref.forceUpdateTask(taskId, stageId)
    })
  }

  renderStageItems() {
    const stages = this.props.stages
    return stages && stages.map((stage) => {
      return (
        <StageItem
          ref={ this.saveStageRef }
          key={ stage._id as string }
          stage={ stage }
          isUsingFilter={ this.props.isUsingFilter }
          tasksExpanded={ this.props.tasksExpanded }
          stageTasksMap={ this.props.stageTasksMap }
          onRequestTasks={ this.props.onRequestTasks }
          onExpandStage={ this.props.onExpandStage }
          onUnexpandStage={ this.props.onUnexpandStage }
          onRequestMoreTasks={ this.props.onRequestMoreTasks }
          onOpenTaskDetail={ this.props.onOpenTaskDetail }
          onOpenTaskCreator={ this.props.onOpenTaskCreator }
          onChangeCurrentTask={ this.props.onChangeCurrentTask }
          onRequestSubtasks={ this.props.onRequestSubtasks }
        />
      )
    })
  }

  renderStageList() {
    return (
      _a
    )
  }

  renderContent() {
    if (this.props.isLoading) {
      return a
    } else {
      return this.renderStageList()
    }
  }

  render() {
    return (
      <div className='gantt-menu-component'>
        { this.renderContent() }
      </div>
    )
  }

}
