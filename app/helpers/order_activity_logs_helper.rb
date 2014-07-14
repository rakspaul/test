module OrderActivityLogsHelper
  def task_actions_states_from_state(task, state=nil)
    state ||= task.task_state.to_sym
    {}.tap do |actions_states_map|
      Task.aasm.events.flat_map do |event_name, event|
        event.transitions_from_state(state).each do |transition|
          if guard = transition.opts[:guard]
            actions_states_map[event.name.to_s.humanize] = transition.to.to_s if task.send(guard)
          else
            actions_states_map[event.name.to_s.humanize] = transition.to.to_s
          end
        end
      end
    end
  end

  def possible_task_actions_for_current_user(task)
    possible_actions = task_actions_states_from_state(task)
    if possible_actions.key?('Close') || possible_actions.key?('Reopen')
      unless task.created_by_id == current_user.id
        possible_actions.delete('Close')
        possible_actions.delete('Reopen')
      end
    end
    possible_actions
  end
end
