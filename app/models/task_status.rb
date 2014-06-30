module TaskStatus

  def self.included(base)
    base.class_eval do

      include AASM

      aasm :column => :task_state, :whiny_transitions => true do
        state :open, :initial => true
        state :complete
        state :close

        event :complete do
          transitions :from => :open, :to => :complete
        end

        event :close do
          transitions :from => :complete, :to => :close
        end

        event :reopen do
          transitions :from => :close, :to => :open
          transitions :from => :complete, :to => :open
        end
      end
    end
  end
end