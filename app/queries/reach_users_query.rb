class ReachUsersQuery
  def initialize(network)
    @network = network
  end

  def query
    User.of_network(@network)
      .joins(:roles)
      .where(roles: { name: Role::REACH_UI}, client_type: User::CLIENT_TYPE_NETWORK)
      .order("first_name, last_name")
  end
end
