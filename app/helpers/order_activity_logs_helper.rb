module OrderActivityLogsHelper
  def task_actions_states_from_state(task, state=nil)
    state ||= task.task_state.to_sym
    @possible_actions_states ||= {}.tap do |actions_states_map|
                                    Task.aasm.events.flat_map do |event_name, event|
                                      event.transitions_from_state(state).each do |transition|
                                        if transition.opts[:guard]
                                          actions_states_map[event.name.to_s.humanize] = transition.to.to_s if task.send(transition.opts[:guard])
                                        else
                                          actions_states_map[event.name.to_s.humanize] = transition.to.to_s
                                        end
                                      end
                                    end
                                  end
  end
end
