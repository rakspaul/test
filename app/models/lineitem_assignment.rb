class LineitemAssignment < ActiveRecord::Base
  belongs_to :lineitem, foreign_key: :io_lineitem_id
  belongs_to :creative, dependent: :destroy
end
