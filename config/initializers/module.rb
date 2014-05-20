class Module
  def const_values
    constants.map {|const| const_get(const)}
  end
end