# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20140513153953) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "accept_decline_creative_jobs", force: true do |t|
    t.integer  "creative_id"
    t.integer  "job_id"
    t.boolean  "decline"
    t.integer  "site_id"
    t.integer  "publisher_id"
    t.integer  "dart_advertiser_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "status"
    t.string   "message"
  end

  create_table "accounts", force: true do |t|
    t.string   "login",                     limit: 40
    t.string   "crypted_password",          limit: 40
    t.string   "salt",                      limit: 40
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "remember_token",            limit: 40
    t.datetime "remember_token_expires_at"
    t.integer  "user_id"
    t.string   "persistence_token"
  end

  add_index "accounts", ["login"], name: "index_accounts_on_login", unique: true, using: :btree

  create_table "activity_attachments", force: true do |t|
    t.string   "file_name",  null: false
    t.string   "file_path"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "activity_categories", force: true do |t|
    t.integer  "network_id"
    t.string   "source_id"
    t.string   "source_spot_id"
    t.integer  "source_tag_method_id"
    t.string   "type"
    t.string   "sub_type"
    t.string   "report_name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "source_activity_id"
    t.integer  "data_source_id",       default: 1, null: false
  end

  add_index "activity_categories", ["data_source_id", "source_id", "network_id"], name: "index_activity_categories_on_trinity", unique: true, using: :btree
  add_index "activity_categories", ["type", "sub_type"], name: "index_activity_categories_on_type_and_sub_type", using: :btree

  create_table "activity_types", force: true do |t|
    t.string "name", null: false
  end

  create_table "ad_geo_targetings", force: true do |t|
    t.integer  "ad_id"
    t.integer  "geo_target_id"
    t.integer  "source_ad_id"
    t.integer  "source_geo_target_id"
    t.boolean  "excluded",             default: false, null: false
    t.datetime "created_at",                           null: false
    t.datetime "updated_at",                           null: false
    t.integer  "network_id"
  end

  add_index "ad_geo_targetings", ["ad_id", "geo_target_id"], name: "index_ad_geo_targetings_on_ad_id_and_geo_target_id", unique: true, using: :btree

  create_table "ad_group_discrepency_log", force: true do |t|
    t.integer "ad_group_id",                           null: false
    t.float   "discrepency",                           null: false
    t.integer "old_booked_imps", limit: 8, default: 0
  end

  create_table "ad_limits", force: true do |t|
    t.string  "name",         null: false
    t.integer "impressions"
    t.integer "time_in_mins"
    t.string  "source_id"
    t.integer "network_id"
  end

  create_table "ad_merge_temp_1", id: false, force: true do |t|
    t.string  "order_id"
    t.text    "ad_id"
    t.text    "name"
    t.string  "cost_type",   limit: 10
    t.float   "rate"
    t.integer "ad_group",    limit: 8
    t.string  "creative_id"
  end

  create_table "ad_order_adv", id: false, force: true do |t|
    t.integer "ad_id",    limit: 8, null: false
    t.integer "order_id"
    t.integer "adv_id"
  end

  create_table "ad_pricings", force: true do |t|
    t.integer  "ad_id",                                     null: false
    t.string   "pricing_type",   limit: 12,                 null: false
    t.float    "rate",                                      null: false
    t.integer  "quantity",                                  null: false
    t.float    "value"
    t.string   "source_id",                                 null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "is_flat_fee",               default: false, null: false
    t.integer  "network_id"
    t.integer  "data_source_id",            default: 1,     null: false
  end

  add_index "ad_pricings", ["ad_id"], name: "ad_pricings_ad_id_unique", unique: true, using: :btree
  add_index "ad_pricings", ["ad_id"], name: "fki_ad_pricings_ad_id", using: :btree
  add_index "ad_pricings", ["data_source_id", "source_id", "network_id"], name: "index_ad_pricings_on_trinity", unique: true, using: :btree

  create_table "ad_pricings_2014_03_26", id: false, force: true do |t|
    t.integer  "id"
    t.integer  "ad_id"
    t.string   "pricing_type",   limit: 12
    t.float    "rate"
    t.integer  "quantity"
    t.float    "value"
    t.string   "source_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "is_flat_fee"
    t.integer  "network_id"
    t.integer  "data_source_id"
  end

  create_table "ad_pricings_rom", id: false, force: true do |t|
    t.integer  "id"
    t.integer  "ad_id"
    t.string   "pricing_type",   limit: 12
    t.float    "rate"
    t.integer  "quantity"
    t.float    "value"
    t.string   "source_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "is_flat_fee"
    t.integer  "network_id"
    t.integer  "data_source_id"
  end

  create_table "ad_rm_150_upd", id: false, force: true do |t|
    t.integer "ad_id"
    t.integer "rich_media_type_id"
  end

  create_table "ad_rm_6", id: false, force: true do |t|
    t.integer "ad_id"
    t.integer "rich_media_type_id"
  end

  create_table "ad_rm_6_upd", id: false, force: true do |t|
    t.integer "ad_id"
    t.integer "rich_media_type_id"
  end

  create_table "adapt_payouts_backup", id: false, force: true do |t|
    t.string  "site_name",  limit: nil
    t.integer "site_id"
    t.string  "adv_name",   limit: nil
    t.integer "adv_id"
    t.date    "start_date"
    t.date    "end_date"
    t.float   "rate"
    t.string  "type",       limit: nil
    t.string  "z_site",     limit: nil
    t.string  "slot_size",  limit: 12
  end

  create_table "adcouncil_segments", id: false, force: true do |t|
    t.text    "name"
    t.integer "id"
    t.integer "dp_id"
  end

  create_table "adj_stg_multi_purged", id: false, force: true do |t|
    t.integer "id",                        limit: 8
    t.integer "arm_billing_period_id",     limit: 8
    t.string  "third_party_name",          limit: 128
    t.string  "advertiser_id"
    t.string  "order_id"
    t.string  "ad_id"
    t.string  "creative_id"
    t.string  "creative_name",             limit: 512
    t.string  "third_party_creative_id",   limit: 512
    t.string  "third_party_creative_name", limit: 512
    t.integer "impressions",               limit: 8
    t.integer "third_party_impressions",   limit: 8
    t.integer "contracted_impressions",    limit: 8
    t.integer "scheduled_impressions",     limit: 8
    t.integer "clicks",                    limit: 8
    t.integer "third_party_clicks",        limit: 8
    t.integer "contracted_clicks",         limit: 8
    t.integer "scheduled_clicks",          limit: 8
  end

  create_table "adjuster_data_dup", id: false, force: true do |t|
    t.integer "adjuster_data_staging_id", limit: 8
    t.boolean "approved",                           default: false
  end

  add_index "adjuster_data_dup", ["adjuster_data_staging_id"], name: "adjuster_data_dup_adjuster_data_staging_id_key", unique: true, using: :btree

  create_table "adjuster_data_multi", id: false, force: true do |t|
    t.integer "adjuster_data_staging_id", limit: 8
    t.integer "seq"
  end

  add_index "adjuster_data_multi", ["adjuster_data_staging_id"], name: "adjuster_data_multi_adjuster_data_staging_id_key", unique: true, using: :btree

  create_table "adjuster_data_staging", id: false, force: true do |t|
    t.integer "id",                        limit: 8,   default: "nextval('adjuster_data_staging_id_seq'::regclass)", null: false
    t.integer "arm_billing_period_id",     limit: 8
    t.string  "third_party_name",          limit: 128
    t.string  "advertiser_id",                                                                                       null: false
    t.string  "order_id",                                                                                            null: false
    t.string  "ad_id",                                                                                               null: false
    t.string  "creative_id",                                                                                         null: false
    t.string  "creative_name",             limit: 512
    t.string  "third_party_creative_id",   limit: 512
    t.string  "third_party_creative_name", limit: 512
    t.integer "impressions",               limit: 8
    t.integer "third_party_impressions",   limit: 8
    t.integer "contracted_impressions",    limit: 8
    t.integer "scheduled_impressions",     limit: 8
    t.integer "clicks",                    limit: 8
    t.integer "third_party_clicks",        limit: 8
    t.integer "contracted_clicks",         limit: 8
    t.integer "scheduled_clicks",          limit: 8
  end

  add_index "adjuster_data_staging", ["id"], name: "adjuster_data_staging_id_key", unique: true, using: :btree

  create_table "adjuster_deliveries", force: true do |t|
    t.date     "report_date",             null: false
    t.integer  "ad_id",                   null: false
    t.integer  "creative_id",             null: false
    t.string   "third_party_name"
    t.integer  "impressions"
    t.integer  "clicks"
    t.integer  "third_party_impressions"
    t.integer  "third_party_clicks"
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
  end

  add_index "adjuster_deliveries", ["ad_id"], name: "index_adjuster_deliveries_on_ad_id", using: :btree
  add_index "adjuster_deliveries", ["creative_id"], name: "index_adjuster_deliveries_on_creative_id", using: :btree
  add_index "adjuster_deliveries", ["report_date"], name: "index_adjuster_deliveries_on_report_date", using: :btree
  add_index "adjuster_deliveries", ["third_party_name"], name: "index_adjuster_deliveries_on_third_party_name", using: :btree

  create_table "adjuster_stg_dup", id: false, force: true do |t|
    t.integer "id",                        limit: 8
    t.integer "arm_billing_period_id",     limit: 8
    t.string  "third_party_name",          limit: 128
    t.string  "advertiser_id"
    t.string  "order_id"
    t.string  "ad_id"
    t.string  "creative_id"
    t.string  "creative_name",             limit: 512
    t.string  "third_party_creative_id",   limit: 512
    t.string  "third_party_creative_name", limit: 512
    t.integer "impressions",               limit: 8
    t.integer "third_party_impressions",   limit: 8
    t.integer "contracted_impressions",    limit: 8
    t.integer "scheduled_impressions",     limit: 8
    t.integer "clicks",                    limit: 8
    t.integer "third_party_clicks",        limit: 8
    t.integer "contracted_clicks",         limit: 8
    t.integer "scheduled_clicks",          limit: 8
    t.integer "rown",                      limit: 8
  end

  create_table "adjuster_stg_multi", id: false, force: true do |t|
    t.integer "id",                        limit: 8
    t.integer "arm_billing_period_id",     limit: 8
    t.string  "third_party_name",          limit: 128
    t.string  "advertiser_id"
    t.string  "order_id"
    t.string  "ad_id"
    t.string  "creative_id"
    t.string  "creative_name",             limit: 512
    t.string  "third_party_creative_id",   limit: 512
    t.string  "third_party_creative_name", limit: 512
    t.integer "impressions",               limit: 8
    t.integer "third_party_impressions",   limit: 8
    t.integer "contracted_impressions",    limit: 8
    t.integer "scheduled_impressions",     limit: 8
    t.integer "clicks",                    limit: 8
    t.integer "third_party_clicks",        limit: 8
    t.integer "contracted_clicks",         limit: 8
    t.integer "scheduled_clicks",          limit: 8
  end

  create_table "adjuster_stg_single", id: false, force: true do |t|
    t.integer "id",                        limit: 8
    t.integer "arm_billing_period_id",     limit: 8
    t.string  "third_party_name",          limit: 128
    t.string  "advertiser_id"
    t.string  "order_id"
    t.string  "ad_id"
    t.string  "creative_id"
    t.string  "creative_name",             limit: 512
    t.string  "third_party_creative_id",   limit: 512
    t.string  "third_party_creative_name", limit: 512
    t.integer "impressions",               limit: 8
    t.integer "third_party_impressions",   limit: 8
    t.integer "contracted_impressions",    limit: 8
    t.integer "scheduled_impressions",     limit: 8
    t.integer "clicks",                    limit: 8
    t.integer "third_party_clicks",        limit: 8
    t.integer "contracted_clicks",         limit: 8
    t.integer "scheduled_clicks",          limit: 8
  end

  create_table "admin_categories", force: true do |t|
    t.string   "type",                            null: false
    t.string   "name",                            null: false
    t.string   "scope"
    t.string   "display"
    t.string   "link",                            null: false
    t.string   "link_scope"
    t.string   "link_display"
    t.string   "fk"
    t.string   "label"
    t.string   "linkto"
    t.boolean  "no_network",      default: false, null: false
    t.boolean  "no_network_link", default: false, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "read_only",       default: false, null: false
  end

  create_table "admin_categories_networks", id: false, force: true do |t|
    t.integer "admin_category_id"
    t.integer "network_id"
  end

  add_index "admin_categories_networks", ["admin_category_id", "network_id"], name: "index_acn_on_ac_id_and_n_id", unique: true, using: :btree
  add_index "admin_categories_networks", ["admin_category_id"], name: "index_acn_on_ac_id", using: :btree
  add_index "admin_categories_networks", ["network_id"], name: "index_acn_on_n_id", using: :btree

  create_table "ads", force: true do |t|
    t.string   "description",                                             null: false
    t.integer  "order_id",                                                null: false
    t.string   "source_id",                                               null: false
    t.string   "ad_type",                   limit: 32
    t.string   "size",                      limit: 12,                    null: false
    t.float    "rate"
    t.string   "cost_type",                 limit: 10
    t.datetime "start_date"
    t.datetime "end_date"
    t.boolean  "delivered",                               default: false, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "designated_market_area_id"
    t.integer  "channel_id"
    t.integer  "site_region_target_id"
    t.integer  "tgt_type_id"
    t.boolean  "active",                                  default: true,  null: false
    t.integer  "geo_type_id"
    t.integer  "mkt_type_id"
    t.boolean  "ad_group_verified",                       default: false, null: false
    t.string   "alt_ad_id"
    t.integer  "priority"
    t.boolean  "site_targeting_included"
    t.integer  "ad_group_id",               limit: 8
    t.string   "keyvalue_targeting",        limit: 32000
    t.integer  "appnexus_id"
    t.integer  "network_id"
    t.integer  "data_source_id",                          default: 1,     null: false
    t.integer  "rate_type_id"
    t.integer  "media_type_id"
    t.integer  "io_lineitem_id"
    t.string   "nielsen_campaign_id"
    t.text     "reach_custom_kv_targeting"
    t.integer  "format_type_id"
    t.integer  "screen_type_id"
    t.integer  "objective_id"
    t.string   "status"
  end

  add_index "ads", ["ad_group_id"], name: "ads_ad_group_index", using: :btree
  add_index "ads", ["appnexus_id"], name: "unique_ads_appnexus_id", unique: true, using: :btree
  add_index "ads", ["data_source_id", "source_id", "network_id"], name: "index_ads_on_trinity", unique: true, using: :btree
  add_index "ads", ["io_lineitem_id"], name: "index_ads_on_io_lineitem_id", using: :btree
  add_index "ads", ["order_id"], name: "fki_ads_order_id", using: :btree

  create_table "ads_ad_limits", id: false, force: true do |t|
    t.integer "ad_id",       null: false
    t.integer "ad_limit_id", null: false
  end

  add_index "ads_ad_limits", ["ad_id", "ad_limit_id"], name: "index_ads_ad_limits_on_ad_id_and_ad_limit_id", using: :btree

  create_table "ads_audience_report_meta_data", id: false, force: true do |t|
    t.integer "audience_report_meta_data_id"
    t.integer "ad_id"
  end

  create_table "ads_channels", id: false, force: true do |t|
    t.integer "ad_id"
    t.integer "channel_id"
  end

  add_index "ads_channels", ["ad_id", "channel_id"], name: "index_ads_channels_on_ad_id_and_channel_id", using: :btree

  create_table "ads_custom", id: false, force: true do |t|
    t.string  "description"
    t.integer "id",                limit: 8
    t.integer "imps",              limit: 8
    t.integer "media_type_id_old"
    t.integer "media_type_id_new"
    t.string  "creative_size",     limit: 50
  end

  create_table "ads_custom_2", id: false, force: true do |t|
    t.string  "description"
    t.integer "id",                limit: 8
    t.integer "media_type_id_old"
    t.integer "media_type_id_new"
  end

  create_table "ads_reach_audience_groups", force: true do |t|
    t.integer "ad_id",                   null: false
    t.integer "reach_audience_group_id", null: false
  end

  add_index "ads_reach_audience_groups", ["ad_id", "reach_audience_group_id"], name: "index_ads_reach_audience_groups_on_ad_id_and_rag_id", using: :btree

  create_table "ads_rom", id: false, force: true do |t|
    t.integer  "id"
    t.string   "description"
    t.integer  "order_id"
    t.string   "source_id"
    t.string   "ad_type",                   limit: 32
    t.string   "size",                      limit: 12
    t.float    "rate"
    t.string   "cost_type",                 limit: 10
    t.datetime "start_date"
    t.datetime "end_date"
    t.boolean  "delivered"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "designated_market_area_id"
    t.integer  "channel_id"
    t.integer  "site_region_target_id"
    t.integer  "tgt_type_id"
    t.boolean  "active"
    t.integer  "geo_type_id"
    t.integer  "mkt_type_id"
    t.boolean  "ad_group_verified"
    t.string   "alt_ad_id"
    t.integer  "priority"
    t.boolean  "site_targeting_included"
    t.integer  "ad_group_id",               limit: 8
    t.string   "keyvalue_targeting",        limit: 32000
    t.integer  "appnexus_id"
    t.integer  "network_id"
    t.integer  "data_source_id"
    t.integer  "rate_type_id"
    t.integer  "media_type_id"
    t.integer  "io_lineitem_id"
    t.string   "nielsen_campaign_id"
  end

  create_table "ads_test", id: false, force: true do |t|
    t.integer  "id"
    t.string   "description"
    t.integer  "order_id"
    t.string   "source_id"
    t.string   "ad_type",                   limit: 32
    t.string   "size",                      limit: 12
    t.float    "rate"
    t.string   "cost_type",                 limit: 10
    t.date     "start_date"
    t.date     "end_date"
    t.boolean  "delivered"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "designated_market_area_id"
    t.integer  "channel_id"
    t.integer  "site_region_target_id"
    t.integer  "tgt_type_id"
    t.boolean  "active"
    t.integer  "geo_type_id"
    t.integer  "mkt_type_id"
    t.integer  "ad_group_id",               limit: 8
    t.boolean  "ad_group_verified"
    t.string   "alt_ad_id"
  end

  add_index "ads_test", ["order_id"], name: "ind_ao", using: :btree

  create_table "adserving_payouts", id: false, force: true do |t|
    t.string  "adv_name",   limit: nil
    t.integer "adv_id"
    t.string  "order_name", limit: nil
    t.integer "order_id"
    t.string  "ad_name",    limit: nil
    t.integer "ad_id"
    t.date    "start_date"
    t.float   "rate"
    t.string  "dp_name",    limit: nil
    t.integer "dp_id"
    t.date    "end_date"
  end

  create_table "adv_cats", force: true do |t|
    t.string   "category",   limit: 45
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "network_id"
  end

  add_index "adv_cats", ["network_id", "category"], name: "index_adv_cats_on_network_id_and_category", unique: true, using: :btree

  create_table "adverify_orders", id: false, force: true do |t|
    t.integer "id"
    t.string  "name",       limit: nil
    t.integer "adv_id"
    t.string  "adv_name",   limit: nil
    t.date    "start_date"
  end

  create_table "advertiser_types", force: true do |t|
    t.string   "name",       null: false
    t.integer  "network_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "advertisers_audience_report_meta_data", id: false, force: true do |t|
    t.integer "audience_report_meta_data_id"
    t.integer "advertiser_id"
  end

  create_table "agencies", force: true do |t|
    t.string   "name"
    t.integer  "source_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "network_id"
  end

  add_index "agencies", ["network_id", "name"], name: "index_agencies_on_network_id_and_name", unique: true, using: :btree

  create_table "agg_zones", id: false, force: true do |t|
    t.string "source_id", limit: 80
    t.string "keyname",   limit: 80
  end

  add_index "agg_zones", ["source_id"], name: "ind_source_id", unique: true, using: :btree

  create_table "amp2_ads", force: true do |t|
    t.integer  "amp2_ad_id",                       null: false
    t.integer  "amp2_order_id",                    null: false
    t.string   "source_id",                        null: false
    t.string   "source_order_id",                  null: false
    t.string   "description",                      null: false
    t.string   "ad_type"
    t.string   "size",                             null: false
    t.string   "tgt_type"
    t.string   "mkt_type"
    t.string   "geo_type"
    t.string   "cost_type"
    t.float    "rate"
    t.date     "start_date"
    t.date     "end_date"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "dma"
    t.string   "srt"
    t.string   "source_srt_id"
    t.string   "channel"
    t.string   "source_channel_id"
    t.boolean  "active",            default: true, null: false
  end

  add_index "amp2_ads", ["source_id"], name: "index_amp2_ads_on_source_id", using: :btree
  add_index "amp2_ads", ["source_order_id"], name: "index_amp2_ads_on_source_order_id", using: :btree

  create_table "amp2_agencies", force: true do |t|
    t.string   "name"
    t.integer  "network_id"
    t.integer  "source_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "amp2_assignments", force: true do |t|
    t.integer "amp2_ad_id"
    t.integer "amp2_creative_id"
    t.string  "name"
    t.date    "start_date"
    t.date    "end_date"
    t.string  "source_ad_id"
    t.string  "version"
    t.text    "click_through_url"
  end

  add_index "amp2_assignments", ["amp2_ad_id"], name: "index_amp2_assignments_on_amp2_ad_id", using: :btree
  add_index "amp2_assignments", ["amp2_creative_id"], name: "index_amp2_assignments_on_amp2_creative_id", using: :btree

  create_table "amp2_behavioral_segments", id: false, force: true do |t|
    t.integer "id",                           null: false
    t.integer "br_rule_id"
    t.string  "name",                         null: false
    t.integer "channel_context_id",           null: false
    t.integer "frequency",                    null: false
    t.integer "bs_time",                      null: false
    t.string  "bs_type",            limit: 2
  end

  create_table "amp2_channel_contexts", id: false, force: true do |t|
    t.integer "id",                           null: false
    t.string  "name",                         null: false
    t.integer "br_channel_id"
    t.integer "br_mapping_id"
    t.string  "cc_type",            limit: 2
    t.integer "channel_context_id"
    t.string  "friendly_name"
  end

  create_table "amp2_channel_site_maps", force: true do |t|
    t.integer "network_id"
    t.string  "source_channel_id"
    t.integer "source_site_id"
  end

  create_table "amp2_channel_zone_maps", force: true do |t|
    t.integer "network_id"
    t.string  "source_channel_id"
    t.integer "source_zone_id"
  end

  create_table "amp2_channels", force: true do |t|
    t.integer "network_id"
    t.string  "source_id"
    t.string  "name"
    t.integer "amp2_channel_id"
  end

  create_table "amp2_creatives", force: true do |t|
    t.integer "amp2_creative_id"
    t.string  "source_id"
    t.string  "name"
    t.integer "amp2_advertiser_id"
    t.string  "source_advertiser_id"
    t.string  "size"
    t.integer "width"
    t.integer "height"
    t.string  "creative_type"
  end

  add_index "amp2_creatives", ["amp2_creative_id"], name: "index_amp2_creatives_on_amp2_creative_id", using: :btree

  create_table "amp2_datemap", primary_key: "datekey", force: true do |t|
    t.date    "realdate"
    t.integer "yr"
    t.integer "mo"
    t.integer "dy"
    t.integer "qtr"
  end

  add_index "amp2_datemap", ["realdate", "yr", "mo", "dy", "qtr"], name: "index_amp2_datemap_on_realdate_and_yr_and_mo_and_dy_and_qtr", unique: true, using: :btree

  create_table "amp2_fees", force: true do |t|
    t.integer "network_id"
    t.integer "fee_type_id"
    t.date    "start_date"
    t.date    "end_date"
    t.float   "cpm"
  end

  create_table "amp2_network_advertisers", force: true do |t|
    t.integer  "network_id",                         null: false
    t.integer  "amp2_advertiser_id",                 null: false
    t.string   "source_id",                          null: false
    t.string   "name",                               null: false
    t.integer  "subnetwork_id"
    t.string   "category"
    t.string   "alt_advertiser_id"
    t.boolean  "default_advertiser", default: false, null: false
    t.boolean  "active",             default: true,  null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "amp2_network_advertisers", ["network_id"], name: "index_amp2_network_advertisers_on_network_id", using: :btree
  add_index "amp2_network_advertisers", ["source_id"], name: "index_amp2_network_advertisers_on_source_id", using: :btree

  create_table "amp2_network_publishers", force: true do |t|
    t.integer  "network_id",                       null: false
    t.integer  "amp2_master_id"
    t.integer  "amp2_publisher_id"
    t.string   "name"
    t.string   "z_pub_name"
    t.string   "site_name"
    t.integer  "source_site_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "active",            default: true, null: false
  end

  add_index "amp2_network_publishers", ["amp2_publisher_id"], name: "index_amp2_network_publishers_on_amp2_publisher_id", using: :btree
  add_index "amp2_network_publishers", ["network_id"], name: "index_amp2_network_publishers_on_network_id", using: :btree
  add_index "amp2_network_publishers", ["source_site_id"], name: "index_amp2_network_publishers_on_source_site_id", using: :btree

  create_table "amp2_orders", force: true do |t|
    t.integer  "amp2_order_id",                                 null: false
    t.integer  "amp2_advertiser_id",                            null: false
    t.string   "source_advertiser_id",                          null: false
    t.string   "source_id",                                     null: false
    t.string   "name",                                          null: false
    t.string   "sales_person"
    t.string   "agency"
    t.string   "business_type"
    t.boolean  "payout_flag",                    default: true, null: false
    t.integer  "cpm_booked",           limit: 8
    t.integer  "cpc_booked",           limit: 8
    t.float    "cpm_rate"
    t.float    "cpc_rate"
    t.float    "gross_value"
    t.date     "start_date"
    t.date     "end_date"
    t.string   "region"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "sales_office"
    t.boolean  "active",                         default: true, null: false
  end

  add_index "amp2_orders", ["source_advertiser_id"], name: "index_amp2_orders_on_source_advertiser_id", using: :btree
  add_index "amp2_orders", ["source_id"], name: "index_amp2_orders_on_source_id", using: :btree

  create_table "amp2_publisher_revenues", force: true do |t|
    t.integer "amp2_publisher_revenue_id"
    t.integer "amp2_publisher_id"
    t.integer "amp2_zone_id"
    t.integer "source_zone_id"
    t.integer "amp2_context_id"
    t.string  "amp2_context_name"
    t.integer "amp2_advertiser_id"
    t.string  "amp2_advertiser_name"
    t.integer "source_advertiser_id"
    t.string  "creative_size"
    t.float   "revenue_rate"
    t.string  "revenue_type"
    t.string  "slot_size"
    t.date    "start_date"
    t.date    "end_date"
    t.string  "z_site"
    t.boolean "full_regen_required",       default: true,  null: false
    t.boolean "numbers_regen_required",    default: false, null: false
    t.integer "network_id"
  end

  add_index "amp2_publisher_revenues", ["amp2_publisher_id"], name: "index_amp2_publisher_revenues_on_amp2_publisher_id", using: :btree
  add_index "amp2_publisher_revenues", ["amp2_publisher_revenue_id"], name: "index_amp2_publisher_revenues_on_amp2_publisher_revenue_id", using: :btree

  create_table "amp2_site_region_targets", force: true do |t|
    t.integer "network_id"
    t.string  "source_id"
    t.string  "name"
    t.integer "amp2_str_id"
  end

  create_table "amp2_sites", force: true do |t|
    t.integer  "amp2_site_id",                     null: false
    t.integer  "amp2_publisher_id",                null: false
    t.integer  "amp2_master_id",                   null: false
    t.string   "source_id",                        null: false
    t.string   "name"
    t.string   "key_name"
    t.string   "description"
    t.string   "site_type"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "active",            default: true, null: false
  end

  add_index "amp2_sites", ["amp2_publisher_id"], name: "index_amp2_sites_on_amp2_publisher_id", using: :btree
  add_index "amp2_sites", ["amp2_site_id"], name: "index_amp2_sites_on_amp2_site_id", using: :btree
  add_index "amp2_sites", ["source_id"], name: "index_amp2_sites_on_source_id", using: :btree

  create_table "amp2_srt_sites_maps", force: true do |t|
    t.integer "network_id"
    t.integer "source_site_id"
    t.string  "source_srt_id"
  end

  create_table "amp2_zones", force: true do |t|
    t.integer  "amp2_zone_id"
    t.string   "source_zone_id"
    t.string   "source_id"
    t.integer  "amp2_site_id"
    t.string   "source_site_id"
    t.string   "name"
    t.string   "z_pub"
    t.string   "z_site"
    t.string   "z_ctx"
    t.string   "content_type"
    t.string   "audience_type"
    t.string   "tag_type"
    t.boolean  "always_payout_flag", default: false, null: false
    t.string   "zone_section"
    t.string   "site_section"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "active",             default: true,  null: false
  end

  add_index "amp2_zones", ["amp2_site_id"], name: "index_amp2_zones_on_amp2_site_id", using: :btree
  add_index "amp2_zones", ["amp2_zone_id"], name: "index_amp2_zones_on_amp2_zone_id", using: :btree
  add_index "amp2_zones", ["source_id"], name: "index_amp2_zones_on_source_id", using: :btree

  create_table "amp_data_staging", id: false, force: true do |t|
    t.integer "id",                    limit: 8, default: "nextval('amp_data_staging_id_seq'::regclass)", null: false
    t.integer "arm_billing_period_id", limit: 8
    t.integer "amp_ad_id",                                                                                null: false
    t.integer "amp_creative_id",                                                                          null: false
    t.string  "source_ad_id"
    t.string  "source_creative_id"
    t.integer "impressions",           limit: 8
    t.integer "clicks",                limit: 8
  end

  add_index "amp_data_staging", ["id"], name: "amp_data_staging_id_key", unique: true, using: :btree

  create_table "amp_data_tmp", id: false, force: true do |t|
    t.date    "report_date",                null: false
    t.integer "amp_ad_id",       limit: 8,  null: false
    t.integer "amp_creative_id", limit: 8,  null: false
    t.string  "impressions",     limit: 32
    t.string  "clicks",          limit: 32
  end

  create_table "amp_order_attachments", force: true do |t|
    t.string   "original_filename"
    t.string   "content_type"
    t.string   "file_hash"
    t.string   "upload_type"
    t.integer  "user_id"
    t.integer  "amp_order_id"
    t.datetime "created_at",        null: false
    t.datetime "updated_at",        null: false
  end

  create_table "amp_order_notes", force: true do |t|
    t.text     "body"
    t.integer  "user_id"
    t.integer  "amp_order_id"
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
  end

  create_table "amp_order_pixels", force: true do |t|
    t.integer "amp_order_id", null: false
    t.integer "pixel_id"
    t.string  "pixel_type",   null: false
    t.string  "pixel_text"
  end

  add_index "amp_order_pixels", ["amp_order_id", "pixel_id", "pixel_type", "pixel_text"], name: "amp_order_pixel_unique_index", unique: true, using: :btree
  add_index "amp_order_pixels", ["amp_order_id"], name: "index_amp_order_pixels_on_amp_order_id", using: :btree

  create_table "amp_orders", force: true do |t|
    t.integer  "advertiser_id"
    t.integer  "opportunity_id"
    t.integer  "frequency_cap_num"
    t.integer  "frequency_cap_every"
    t.string   "frequency_cap_units"
    t.string   "client_order_num"
    t.string   "third_party_login"
    t.string   "third_party_username"
    t.string   "third_party_password"
    t.string   "performance_ad_server_username"
    t.string   "performance_ad_server_password"
    t.text     "competitors"
    t.text     "competitor_pricing_comparison"
    t.text     "plan_performance_note"
    t.string   "video_third_party_login"
    t.string   "video_third_party_username"
    t.string   "video_third_party_password"
    t.string   "mobile_third_party_login"
    t.string   "mobile_third_party_username"
    t.string   "mobile_third_party_password"
    t.datetime "created_at",                                                     null: false
    t.datetime "updated_at",                                                     null: false
    t.string   "status",                         default: "Pending Information"
    t.string   "roi_metric_override"
    t.string   "roi_goal_override"
    t.boolean  "pc_credit_override"
    t.string   "pc_look_back_override"
    t.boolean  "pi_credit_override"
    t.string   "pi_look_back_override"
    t.string   "video_roi_metric_override"
    t.string   "video_roi_goal_override"
    t.string   "mobile_roi_metric_override"
    t.string   "mobile_roi_goal_override"
    t.string   "source_id"
    t.boolean  "advertiser_pending",             default: false,                 null: false
  end

  add_index "amp_orders", ["source_id"], name: "index_amp_orders_on_source_id", unique: true, using: :btree

  create_table "an_ads", id: false, force: true do |t|
    t.integer "ad_id",                   null: false
    t.decimal "lifetime_budget"
    t.integer "lifetime_budget_imps"
    t.decimal "daily_budget"
    t.integer "daily_budget_imps"
    t.decimal "learn_budget"
    t.integer "learn_budget_imps"
    t.decimal "learn_budget_daily_cap"
    t.integer "learn_budget_daily_imps"
    t.string  "cpm_bid_type"
    t.decimal "max_bid"
    t.decimal "min_bid"
    t.string  "inventory_option"
  end

  create_table "an_conversion_tracking", id: false, force: true do |t|
    t.integer "order_id",    null: false
    t.integer "an_pixel_id", null: false
  end

  create_table "an_orders", id: false, force: true do |t|
    t.integer "order_id"
    t.string  "revenue_type"
    t.decimal "revenue_value"
  end

  create_table "applications", force: true do |t|
    t.string "name", null: false
  end

  create_table "appnexus_app_users", force: true do |t|
    t.string  "user_name",                           null: false
    t.string  "password",                            null: false
    t.integer "network_id",                          null: false
    t.string  "net_prefix",                          null: false
    t.integer "application_id",                      null: false
    t.integer "app_nexus_network_id",                null: false
    t.boolean "allow_updates",        default: true
    t.string  "token"
  end

  add_index "appnexus_app_users", ["user_name"], name: "index_appnexus_app_users_on_user_name", unique: true, using: :btree

  create_table "appnexus_brand_categories", id: false, force: true do |t|
    t.string "source_id", null: false
    t.string "name",      null: false
  end

  create_table "appnexus_brand_categories_networks", id: false, force: true do |t|
    t.integer "appnexus_network_id",        null: false
    t.string  "appnexus_brand_category_id", null: false
    t.string  "status",                     null: false
  end

  create_table "appnexus_brands", id: false, force: true do |t|
    t.string "source_id",   null: false
    t.string "name",        null: false
    t.string "category_id"
  end

  create_table "appnexus_brands_networks", id: false, force: true do |t|
    t.integer "appnexus_network_id", null: false
    t.string  "appnexus_brand_id",   null: false
    t.string  "status",              null: false
  end

  create_table "appnexus_cities", force: true do |t|
    t.string "name",         null: false
    t.string "region"
    t.string "region_name"
    t.string "country_code"
    t.string "country_name"
  end

  create_table "appnexus_dart_cities", id: false, force: true do |t|
    t.integer "dart_id",     null: false
    t.integer "appnexus_id", null: false
  end

  create_table "appnexus_members_networks", id: false, force: true do |t|
    t.integer "appnexus_network_id", null: false
    t.string  "appnexus_member_id",  null: false
    t.string  "status",              null: false
  end

  create_table "appnexus_network_configs", id: false, force: true do |t|
    t.integer "appnexus_network_id",                null: false
    t.string  "default_ad_server_status",           null: false
    t.string  "default_audit_type",                 null: false
    t.string  "default_brand_status",               null: false
    t.string  "default_category_status",            null: false
    t.string  "default_language_status",            null: false
    t.string  "default_member_status",              null: false
    t.string  "default_technical_attribute_status", null: false
  end

  create_table "appnexus_networks", id: false, force: true do |t|
    t.integer  "appnexus_network_id",                     null: false
    t.string   "appnexus_network_name",                   null: false
    t.integer  "amp_network_id",                          null: false
    t.boolean  "active",                                  null: false
    t.datetime "created_at",            default: "now()"
    t.datetime "updated_at",            default: "now()"
    t.string   "server_url"
  end

  add_index "appnexus_networks", ["appnexus_network_id"], name: "index_appnexus_networks_on_appnexus_network_id", unique: true, using: :btree

  create_table "appnexus_platform_members", id: false, force: true do |t|
    t.string "source_id",    null: false
    t.string "name",         null: false
    t.string "primary_type", null: false
  end

  create_table "area_code_targeting", id: false, force: true do |t|
    t.integer "ad_id"
    t.integer "area_code_id"
  end

  create_table "area_codes", force: true do |t|
    t.string "code",         limit: 10, null: false
    t.string "name",         limit: 10, null: false
    t.string "country_abbr", limit: 5,  null: false
  end

  create_table "arm_ad_servers", force: true do |t|
    t.string  "name",         limit: 128,                 null: false
    t.string  "display_name", limit: 128,                 null: false
    t.boolean "is_adjuster",              default: false
    t.boolean "enabled",                  default: true
    t.text    "parameters"
  end

  add_index "arm_ad_servers", ["id"], name: "arm_ad_servers_id_key", unique: true, using: :btree
  add_index "arm_ad_servers", ["name"], name: "arm_ad_servers_name_key", unique: true, using: :btree

  create_table "arm_audit_status", id: false, force: true do |t|
    t.integer "id",                      default: "nextval('arm_audit_status_id_seq'::regclass)", null: false
    t.string  "display_name", limit: 64,                                                          null: false
  end

  add_index "arm_audit_status", ["id"], name: "arm_audit_status_id_key", unique: true, using: :btree

  create_table "arm_audit_status_bk", id: false, force: true do |t|
    t.integer "id"
    t.string  "display_name", limit: 64
  end

  create_table "arm_billing_period_statuses", id: false, force: true do |t|
    t.integer "id",                      default: "nextval('arm_billing_period_statuses_id_seq'::regclass)", null: false
    t.string  "status",       limit: 64,                                                                     null: false
    t.string  "display_text", limit: 64
    t.string  "comments"
  end

  add_index "arm_billing_period_statuses", ["id"], name: "arm_billing_period_statuses_id_key", unique: true, using: :btree
  add_index "arm_billing_period_statuses", ["status"], name: "arm_billing_period_statuses_status_key", unique: true, using: :btree

  create_table "arm_billing_periods", id: false, force: true do |t|
    t.integer  "id",                  limit: 8, default: "nextval('arm_billing_periods_id_seq'::regclass)", null: false
    t.integer  "network_id",                                                                                null: false
    t.integer  "month",               limit: 2,                                                             null: false
    t.integer  "year",                limit: 2,                                                             null: false
    t.datetime "created_at",                    default: "now()"
    t.integer  "status_id",                     default: 1,                                                 null: false
    t.date     "data_available_upto"
    t.datetime "updated_at",                    default: "now()"
  end

  add_index "arm_billing_periods", ["id"], name: "arm_billing_periods_id_key", unique: true, using: :btree
  add_index "arm_billing_periods", ["network_id", "month", "year"], name: "arm_billing_periods_network_id_key", unique: true, using: :btree

  create_table "arm_bp_16_data", id: false, force: true do |t|
    t.integer  "item",             limit: 8
    t.integer  "audit_status"
    t.integer  "discrepancy_code"
    t.integer  "ad_server"
    t.text     "advertiser_name"
    t.text     "order_name"
    t.integer  "ad_group_id",      limit: 8
    t.text     "ad_group_name"
    t.string   "rate_type",        limit: 10
    t.float    "rate"
    t.string   "tp_server",        limit: 128
    t.string   "fp_server",        limit: 128
    t.integer  "imps",             limit: 8
    t.integer  "imps_1",           limit: 8
    t.integer  "imps_2",           limit: 8
    t.integer  "booked_imps",      limit: 8
    t.integer  "adj_imps",         limit: 8
    t.integer  "clks",             limit: 8
    t.integer  "clks_1",           limit: 8
    t.integer  "clks_2",           limit: 8
    t.integer  "booked_clks",      limit: 8
    t.integer  "adj_clks",         limit: 8
    t.decimal  "rev"
    t.decimal  "discrp"
    t.decimal  "booked_rev"
    t.decimal  "adj_rev"
    t.decimal  "sor_rev"
    t.decimal  "adj_gross_rev"
    t.decimal  "cml_rev"
    t.decimal  "adj_gross_rate"
    t.integer  "sor_impressions",  limit: 8
    t.integer  "sor_clicks",       limit: 8
    t.float    "adj_qty"
    t.datetime "timestamp"
    t.string   "account_login",    limit: 100
  end

  create_table "arm_coversheet_details", force: true do |t|
    t.integer  "network_id",                                               null: false
    t.string   "advertiser",                 limit: 512,                   null: false
    t.integer  "advertiser_category",                                      null: false
    t.integer  "agency"
    t.integer  "dart_order",                                               null: false, array: true
    t.integer  "extended_reach",                                           null: false
    t.integer  "opportunity",                                              null: false, array: true
    t.string   "io_number",                  limit: 512
    t.float    "net_io_value",                                             null: false
    t.integer  "campaign_type",                                            null: false
    t.integer  "rich_media",                                               null: false
    t.integer  "billing_ad_server",                                        null: false, array: true
    t.integer  "business_type",                                            null: false
    t.string   "product_desc",               limit: 512,                   null: false
    t.string   "campaign_objective",         limit: 512,                   null: false
    t.integer  "marketing_type",                                           null: false
    t.string   "notes",                      limit: 512
    t.integer  "third_party_research_study",                               null: false
    t.string   "study_type",                 limit: 512
    t.integer  "collective_salesperson",                                   null: false
    t.integer  "collective_sales_office",                                  null: false
    t.integer  "collective_sales_region",                                  null: false
    t.integer  "collective_billing"
    t.integer  "client_contact"
    t.integer  "client_billing_contact"
    t.integer  "client_adops_contact"
    t.integer  "targeting_detail_id",        limit: 8,                     null: false
    t.integer  "video_detail_id",            limit: 8
    t.integer  "io_detail_id",                                                          array: true
    t.integer  "metrics_detail_id",                                        null: false
    t.datetime "updated_at",                             default: "now()"
    t.integer  "billing_agency",                                           null: false
    t.integer  "crew_name",                                                null: false
  end

  create_table "arm_coversheet_draft", id: false, force: true do |t|
    t.integer  "network_id"
    t.string   "advertiser"
    t.integer  "advertiser_category"
    t.integer  "agency"
    t.integer  "dart_order",                                               array: true
    t.integer  "extended_reach"
    t.integer  "opportunity",                                              array: true
    t.string   "io_number",                  limit: 64
    t.float    "net_io_value"
    t.integer  "solution_id"
    t.integer  "campaign_type"
    t.integer  "rich_media"
    t.integer  "billing_ad_server",                                        array: true
    t.integer  "business_type"
    t.string   "product_desc",               limit: 128
    t.string   "campaign_objective",         limit: 256
    t.integer  "marketing_type"
    t.string   "notes",                      limit: 128
    t.integer  "third_party_research_study"
    t.string   "study_type",                 limit: 128
    t.integer  "collective_salesperson"
    t.integer  "collective_sales_office"
    t.integer  "collective_sales_region"
    t.integer  "collective_billing"
    t.integer  "client_contact"
    t.integer  "client_billing_contact"
    t.integer  "client_adops_contact"
    t.integer  "targeting_detail_id",        limit: 8
    t.integer  "video_detail_id",            limit: 8
    t.integer  "io_detail_id",                                             array: true
    t.integer  "metrics_detail_id"
    t.datetime "updated_at",                             default: "now()"
    t.integer  "billing_agency"
    t.integer  "crew_name"
    t.integer  "usr"
  end

  create_table "arm_cs_agency_list", force: true do |t|
    t.string  "agency_name", null: false
    t.integer "network_id"
  end

  create_table "arm_cs_contacts", force: true do |t|
    t.integer  "network_id"
    t.integer  "contact_type",                               null: false
    t.string   "company",      limit: 512
    t.string   "name",         limit: 512
    t.string   "email",        limit: 512
    t.string   "phone",        limit: 512
    t.datetime "updated_at",               default: "now()"
  end

  create_table "arm_cs_finance_contacts", force: true do |t|
    t.integer "network_id",            null: false
    t.string  "name",       limit: 64, null: false
  end

  add_index "arm_cs_finance_contacts", ["name"], name: "arm_cs_finance_contacts_name_key", unique: true, using: :btree

  create_table "arm_cs_io_deleted", id: false, force: true do |t|
    t.integer  "io_detail_id",  limit: 8,   null: false
    t.integer  "network_id",                null: false
    t.string   "relative_path", limit: 512, null: false
    t.string   "title",         limit: 512, null: false
    t.datetime "uploaded_at",               null: false
    t.datetime "deleted_at",                null: false
  end

  create_table "arm_cs_io_detail", force: true do |t|
    t.integer  "network_id",                                  null: false
    t.string   "relative_path", limit: 512,                   null: false
    t.string   "title",         limit: 512,                   null: false
    t.datetime "uploaded_at",               default: "now()"
  end

  create_table "arm_cs_metrics_detail", force: true do |t|
    t.integer  "roi_metric",                                               null: false
    t.string   "cpa_goal",                   limit: 512
    t.string   "roi_goal",                   limit: 512,                   null: false
    t.integer  "post_imp_credit",                                          null: false
    t.string   "pi_lookback_window",         limit: 512
    t.integer  "post_click_credit",                                        null: false
    t.string   "pc_lookback_window",         limit: 512
    t.string   "other_metric_calc",          limit: 512
    t.string   "competitors",                limit: 512
    t.string   "comp_perf",                  limit: 512
    t.string   "what_works",                 limit: 512
    t.string   "cm_perf",                    limit: 512
    t.integer  "performance_ad_server",                                    null: false, array: true
    t.integer  "login_avail"
    t.string   "third_party_adserver_login", limit: 512
    t.string   "third_party_adserver_pw",    limit: 512
    t.integer  "match_to_dart"
    t.integer  "auto_report"
    t.string   "metric_notes",               limit: 512
    t.datetime "updated_at",                             default: "now()"
  end

  create_table "arm_cs_metrics_draft", id: false, force: true do |t|
    t.integer  "roi_metric"
    t.string   "cpa_goal",                   limit: 64
    t.string   "roi_goal",                   limit: 64
    t.integer  "post_imp_credit"
    t.string   "pi_lookback_window",         limit: 64
    t.integer  "post_click_credit"
    t.string   "pc_lookback_window",         limit: 64
    t.string   "other_metric_calc",          limit: 128
    t.string   "competitors"
    t.string   "comp_perf"
    t.string   "what_works"
    t.string   "cm_perf"
    t.integer  "performance_ad_server",                                    array: true
    t.integer  "login_avail"
    t.string   "third_party_adserver_login", limit: 128
    t.string   "third_party_adserver_pw",    limit: 128
    t.integer  "match_to_dart"
    t.integer  "auto_report"
    t.integer  "include_ron"
    t.integer  "include_rt"
    t.integer  "include_er"
    t.string   "metric_notes"
    t.datetime "updated_at",                             default: "now()"
    t.integer  "usr"
  end

  create_table "arm_cs_opportunity_detail", force: true do |t|
    t.integer  "network_id",                   null: false
    t.integer  "opp_id",                       null: false
    t.date     "start_date",                   null: false
    t.date     "end_date",                     null: false
    t.datetime "updated_at", default: "now()"
  end

  create_table "arm_cs_opportunity_draft", id: false, force: true do |t|
    t.integer  "network_id"
    t.integer  "opp_id"
    t.date     "start_date"
    t.date     "end_date"
    t.datetime "updated_at", default: "now()"
    t.integer  "usr"
  end

  create_table "arm_cs_option_types", force: true do |t|
    t.string "name", limit: 64, null: false
  end

  add_index "arm_cs_option_types", ["name"], name: "arm_cs_option_types_name_key", unique: true, using: :btree

  create_table "arm_cs_options", force: true do |t|
    t.integer "type",                   null: false
    t.integer "index",                  null: false
    t.integer "network_id"
    t.string  "value",      limit: 128
  end

  create_table "arm_cs_order_detail", force: true do |t|
    t.integer  "order_id",   limit: 8
    t.string   "order_name", limit: 512,                   null: false
    t.datetime "updated_at",             default: "now()"
  end

  create_table "arm_cs_order_draft", id: false, force: true do |t|
    t.integer  "usr"
    t.integer  "order_id",   limit: 8
    t.string   "order_name"
    t.datetime "updated_at",           default: "now()"
  end

  create_table "arm_cs_pixel_detail", force: true do |t|
    t.string   "name",       limit: 512
    t.integer  "source_id"
    t.integer  "type_id"
    t.datetime "updated_at",             default: "now()"
  end

  create_table "arm_cs_pixel_draft", id: false, force: true do |t|
    t.string   "io_line_item", limit: 64
    t.integer  "source_id"
    t.integer  "type_id"
    t.string   "name",         limit: 128
    t.datetime "updated_at",               default: "now()"
    t.integer  "usr"
  end

  create_table "arm_cs_targeting_detail", force: true do |t|
    t.integer  "type",                                                     null: false, array: true
    t.string   "behavior_segments",          limit: 512
    t.string   "bt_data_providers",          limit: 512
    t.string   "context_segments",           limit: 512
    t.integer  "geography_type_id",                                        null: false
    t.string   "frequency_cap",              limit: 512
    t.integer  "third_party_ad_verifier_id",                               null: false
    t.string   "targeting_notes",            limit: 512
    t.integer  "pixel_detail_id",                                                       array: true
    t.integer  "vendor_detail_id",                                         null: false
    t.string   "block_sites",                limit: 512
    t.string   "notes",                      limit: 512
    t.datetime "updated_at",                             default: "now()"
    t.integer  "third_party_ver_fee",                                      null: false
    t.float    "third_party_ver_cpm",                                      null: false
  end

  create_table "arm_cs_targeting_draft", id: false, force: true do |t|
    t.integer  "type",                                                     array: true
    t.string   "behavior_segments",          limit: 128
    t.string   "bt_data_providers",          limit: 128
    t.string   "context_segments",           limit: 128
    t.integer  "geography_type_id"
    t.string   "frequency_cap",              limit: 64
    t.integer  "third_party_ad_verifier_id"
    t.string   "targeting_notes",            limit: 128
    t.integer  "pixel_detail_id",                                          array: true
    t.integer  "vendor_detail_id"
    t.string   "block_sites",                limit: 512
    t.string   "notes",                      limit: 128
    t.datetime "updated_at",                             default: "now()"
    t.integer  "third_party_ver_fee"
    t.float    "third_party_ver_cpm"
    t.integer  "usr"
  end

  create_table "arm_cs_vendor_detail", force: true do |t|
    t.integer  "network_id"
    t.integer  "atlas_uat",                         null: false
    t.integer  "rm_vendor_id",                      null: false
    t.float    "rm_cpm"
    t.integer  "rm_fees_paid_by"
    t.integer  "rm_type_id"
    t.datetime "updated_at",      default: "now()"
  end

  create_table "arm_cs_vendor_draft", id: false, force: true do |t|
    t.integer  "network_id"
    t.integer  "atlas_uat"
    t.integer  "rm_vendor_id"
    t.string   "rm_ad_serving_fee", limit: 64
    t.float    "rm_cpm"
    t.integer  "rm_fees_paid_by"
    t.integer  "rm_type_id"
    t.datetime "updated_at",                   default: "now()"
    t.integer  "usr"
  end

  create_table "arm_cs_video_detail", force: true do |t|
    t.date     "start_date",                                               null: false
    t.date     "end_date",                                                 null: false
    t.string   "pre_roll_length",            limit: 512,                   null: false
    t.integer  "companion_banners",                                        null: false
    t.string   "companion_banner_size",      limit: 512,                   null: false
    t.integer  "delivery_req_id",                                          null: false
    t.integer  "targeting_type",                                           null: false, array: true
    t.string   "bt_data_providers",          limit: 512
    t.string   "channel",                    limit: 512
    t.integer  "geography_type_id",                                        null: false
    t.string   "markets",                    limit: 512
    t.integer  "third_party_ad_verifier_id"
    t.string   "reporting_req",              limit: 512
    t.integer  "reporting_frequency_id"
    t.integer  "third_party_rs",                                           null: false
    t.string   "study_type",                 limit: 512
    t.datetime "updated_at",                             default: "now()"
  end

  create_table "arm_cs_video_draft", id: false, force: true do |t|
    t.date     "start_date"
    t.date     "end_date"
    t.string   "pre_roll_length",            limit: nil
    t.integer  "companion_banners"
    t.string   "companion_banner_size"
    t.integer  "delivery_req_id"
    t.string   "bt_data_providers"
    t.string   "channel"
    t.integer  "geography_type_id"
    t.string   "markets"
    t.integer  "third_party_ad_verifier_id"
    t.string   "reporting_req"
    t.integer  "reporting_frequency_id"
    t.integer  "third_party_rs"
    t.string   "study_type"
    t.datetime "updated_at",                             default: "now()"
    t.integer  "targeting_type",                                           array: true
    t.integer  "usr"
  end

  create_table "arm_discrepancy_code", force: true do |t|
    t.string "display_name", limit: 64, null: false
  end

  create_table "arm_merge_ad_map", id: false, force: true do |t|
    t.integer "arm_billing_period_id",   limit: 8
    t.string  "order_id"
    t.string  "ad_id"
    t.string  "creative_id"
    t.integer "impressions",             limit: 8
    t.integer "third_party_impressions", limit: 8
    t.integer "scheduled_impressions",   limit: 8
    t.integer "clicks",                  limit: 8
    t.integer "third_party_clicks",      limit: 8
    t.integer "scheduled_clicks",        limit: 8
    t.text    "new_ad_id"
  end

  create_table "arm_merge_ad_map_1", id: false, force: true do |t|
    t.integer "arm_billing_period_id",   limit: 8
    t.string  "order_id"
    t.string  "ad_id"
    t.string  "creative_id"
    t.integer "impressions",             limit: 8
    t.integer "third_party_impressions", limit: 8
    t.integer "scheduled_impressions",   limit: 8
    t.integer "clicks",                  limit: 8
    t.integer "third_party_clicks",      limit: 8
    t.integer "scheduled_clicks",        limit: 8
    t.text    "new_ad_id"
  end

  create_table "arm_recon_data", id: false, force: true do |t|
    t.integer "id",                       limit: 8,   default: "nextval('arm_recon_data_id_seq'::regclass)", null: false
    t.integer "arm_billing_period_id"
    t.integer "audit_status"
    t.integer "discrepancy_code"
    t.integer "system_of_record"
    t.string  "advertiser_id",                                                                               null: false
    t.string  "order_id",                                                                                    null: false
    t.string  "ad_id",                                                                                       null: false
    t.float   "rate"
    t.float   "adj_gross_rate"
    t.string  "third_party_name",         limit: 128
    t.string  "fourth_party_name",        limit: 128
    t.integer "impressions",              limit: 8
    t.integer "third_party_impressions",  limit: 8
    t.integer "fourth_party_impressions", limit: 8
    t.integer "booked_impressions",       limit: 8
    t.integer "adj_impressions",          limit: 8
    t.integer "cml_impressions",          limit: 8
    t.integer "sor_impressions",          limit: 8
    t.integer "clicks",                   limit: 8
    t.integer "third_party_clicks",       limit: 8
    t.integer "fourth_party_clicks",      limit: 8
    t.integer "booked_clicks",            limit: 8
    t.integer "adj_clicks",               limit: 8
    t.integer "cml_clicks",               limit: 8
    t.integer "sor_clicks",               limit: 8
    t.float   "booked_rev"
    t.float   "adj_rev"
    t.float   "adj_gross_rev"
    t.float   "cml_rev"
  end

  add_index "arm_recon_data", ["arm_billing_period_id", "advertiser_id", "order_id", "ad_id"], name: "arm_recon_data_arm_billing_period_id_key", unique: true, using: :btree
  add_index "arm_recon_data", ["id"], name: "arm_recon_data_id_key", unique: true, using: :btree

  create_table "arm_recon_data_ad_groups", force: true do |t|
    t.integer  "arm_billing_period_id"
    t.integer  "audit_status"
    t.integer  "discrepancy_code"
    t.integer  "system_of_record"
    t.string   "advertiser_id",                                          null: false
    t.string   "order_id",                                               null: false
    t.integer  "ad_group_id",                                            null: false
    t.float    "rate"
    t.float    "adj_gross_rate"
    t.string   "third_party_name",         limit: 128
    t.string   "fourth_party_name",        limit: 128
    t.integer  "impressions",              limit: 8
    t.integer  "third_party_impressions",  limit: 8
    t.integer  "fourth_party_impressions", limit: 8
    t.integer  "booked_impressions",       limit: 8
    t.integer  "adj_impressions",          limit: 8
    t.integer  "cml_impressions",          limit: 8
    t.integer  "sor_impressions",          limit: 8
    t.integer  "clicks",                   limit: 8
    t.integer  "third_party_clicks",       limit: 8
    t.integer  "fourth_party_clicks",      limit: 8
    t.integer  "booked_clicks",            limit: 8
    t.integer  "adj_clicks",               limit: 8
    t.integer  "cml_clicks",               limit: 8
    t.integer  "sor_clicks",               limit: 8
    t.float    "booked_rev"
    t.float    "adj_rev"
    t.float    "adj_gross_rev"
    t.float    "cml_rev"
    t.datetime "last_modified",                        default: "now()"
    t.integer  "user_id"
  end

  add_index "arm_recon_data_ad_groups", ["arm_billing_period_id", "advertiser_id", "order_id", "ad_group_id"], name: "arm_recon_data_ad_groups_arm_billing_period_id_key", unique: true, using: :btree
  add_index "arm_recon_data_ad_groups", ["id"], name: "arm_recon_data_ad_groups_id_key", unique: true, using: :btree

  create_table "arm_recon_data_ad_groups_daily", id: false, force: true do |t|
    t.integer "arm_billing_period_id"
    t.integer "system_of_record"
    t.string  "advertiser_id",                        null: false
    t.string  "order_id",                             null: false
    t.integer "ad_group_id",                          null: false
    t.float   "rate"
    t.float   "adj_gross_rate"
    t.string  "third_party_name",         limit: 128
    t.string  "fourth_party_name",        limit: 128
    t.integer "impressions",              limit: 8
    t.integer "third_party_impressions",  limit: 8
    t.integer "fourth_party_impressions", limit: 8
    t.integer "booked_impressions",       limit: 8
    t.integer "adj_impressions",          limit: 8
    t.integer "clicks",                   limit: 8
    t.integer "third_party_clicks",       limit: 8
    t.integer "fourth_party_clicks",      limit: 8
    t.integer "booked_clicks",            limit: 8
    t.integer "adj_clicks",               limit: 8
    t.float   "booked_rev"
    t.float   "adj_rev"
  end

  add_index "arm_recon_data_ad_groups_daily", ["arm_billing_period_id", "advertiser_id", "order_id", "ad_group_id"], name: "arm_recon_data_ad_groups_daily_arm_billing_period_id_key", unique: true, using: :btree

  create_table "arm_recon_data_ad_groups_history", force: true do |t|
    t.integer  "item_id",               limit: 8,                   null: false
    t.integer  "ad_group_id",                                       null: false
    t.integer  "arm_billing_period_id",                             null: false
    t.string   "column_name",                                       null: false
    t.string   "old_value"
    t.string   "new_value"
    t.datetime "created_at",                      default: "now()", null: false
    t.integer  "user_id"
  end

  create_table "arm_recon_data_daily", id: false, force: true do |t|
    t.integer "arm_billing_period_id"
    t.string  "advertiser_id",                        null: false
    t.string  "order_id",                             null: false
    t.string  "ad_id",                                null: false
    t.float   "rate"
    t.string  "third_party_name",         limit: 128
    t.string  "fourth_party_name",        limit: 128
    t.integer "impressions",              limit: 8
    t.integer "third_party_impressions",  limit: 8
    t.integer "fourth_party_impressions", limit: 8
    t.integer "booked_impressions",       limit: 8
    t.integer "clicks",                   limit: 8
    t.integer "third_party_clicks",       limit: 8
    t.integer "fourth_party_clicks",      limit: 8
    t.integer "booked_clicks",            limit: 8
    t.float   "booked_rev"
  end

  add_index "arm_recon_data_daily", ["arm_billing_period_id", "advertiser_id", "order_id", "ad_id"], name: "arm_recon_data_daily_arm_billing_period_id_key", unique: true, using: :btree

  create_table "arm_recon_data_pre", id: false, force: true do |t|
    t.integer "arm_billing_period_id",    limit: 8
    t.text    "third_party_name"
    t.text    "fourth_party_name"
    t.string  "advertiser_id"
    t.string  "order_id"
    t.string  "ad_id"
    t.string  "creative_id"
    t.integer "impressions",              limit: 8
    t.decimal "third_party_impressions"
    t.decimal "fourth_party_impressions"
    t.integer "contracted_impressions",   limit: 8
    t.integer "scheduled_impressions",    limit: 8
    t.integer "clicks",                   limit: 8
    t.decimal "third_party_clicks"
    t.decimal "fourth_party_clicks"
    t.integer "contracted_clicks",        limit: 8
    t.integer "scheduled_clicks",         limit: 8
    t.integer "apply_adj",                limit: 8
  end

  create_table "arm_recon_status", id: false, force: true do |t|
    t.integer "id",                      null: false
    t.string  "display_name", limit: 64, null: false
  end

  create_table "assignments", force: true do |t|
    t.integer  "ad_id",                      null: false
    t.integer  "creative_id",                null: false
    t.datetime "start_date"
    t.datetime "end_date"
    t.integer  "network_id",                 null: false
    t.integer  "data_source_id", default: 1, null: false
  end

  add_index "assignments", ["ad_id", "creative_id"], name: "assignments_ad_id_creative_id_unique", unique: true, using: :btree
  add_index "assignments", ["ad_id"], name: "fki_assignments_ad_id", using: :btree
  add_index "assignments", ["ad_id"], name: "index_assignments_on_ad_id", using: :btree
  add_index "assignments", ["creative_id"], name: "fki_assignments_creative_id", using: :btree
  add_index "assignments", ["creative_id"], name: "index_assignments_on_creative_id", using: :btree

  create_table "audience_optimizations", force: true do |t|
    t.string   "name",                                null: false
    t.integer  "network_id",                          null: false
    t.integer  "advertiser_id",                       null: false
    t.integer  "order_id",                            null: false
    t.integer  "prior_order_id"
    t.integer  "assignment_network_id",               null: false
    t.float    "apu",                   default: 0.0, null: false
    t.float    "apc",                   default: 0.0, null: false
    t.float    "ctr",                   default: 0.0, null: false
    t.float    "ir",                    default: 0.0, null: false
    t.float    "apu_lift"
    t.float    "apc_lift"
    t.float    "ctr_lift"
    t.float    "ir_lift"
    t.float    "avg_lift"
    t.datetime "last_run_date"
    t.string   "last_run_status"
    t.string   "description"
    t.string   "assignment_type",                     null: false
    t.integer  "assignment_size"
    t.integer  "tiers"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "audience_optimizations_pixels", id: false, force: true do |t|
    t.integer "optimization_id"
    t.integer "pixel_id"
  end

  create_table "audience_report_meta_data", force: true do |t|
    t.date     "start_date",    null: false
    t.date     "end_date",      null: false
    t.string   "period",        null: false
    t.string   "fetch_status",  null: false
    t.integer  "network_id",    null: false
    t.string   "type",          null: false
    t.string   "error_message"
    t.text     "request_url"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
  end

  create_table "audience_report_meta_data_orders", id: false, force: true do |t|
    t.integer "audience_report_meta_data_id"
    t.integer "order_id"
  end

  create_table "audience_report_meta_data_pixels", id: false, force: true do |t|
    t.integer "audience_report_meta_data_id"
    t.integer "pixel_id",                     null: false
  end

  create_table "audience_report_meta_data_segments", force: true do |t|
    t.integer "audience_report_meta_data_id"
    t.integer "segment_id"
  end

  create_table "audience_report_meta_data_sites", id: false, force: true do |t|
    t.integer "audience_report_meta_data_id"
    t.integer "site_id"
  end

  create_table "audience_report_processed_data", force: true do |t|
    t.integer "audience_report_segment_id",                           null: false
    t.string  "name",                                                 null: false
    t.integer "imps",                         limit: 8, default: 0
    t.integer "clicks",                       limit: 8, default: 0
    t.decimal "ctr",                                    default: 0.0
    t.integer "unique_users",                 limit: 8, default: 0
    t.decimal "population_affinity",                    default: 0.0
    t.decimal "cloud_composition",                      default: 0.0
    t.integer "pixel_population",             limit: 8, default: 0
    t.integer "audience_report_meta_data_id"
    t.decimal "internet_affinity",                      default: 0.0
    t.decimal "internet_cloud_composition",             default: 0.0
    t.decimal "segment_composition",                    default: 0.0
    t.decimal "internet_segment_composition",           default: 0.0
    t.integer "tot_actions",                  limit: 8, default: 0
    t.decimal "ar",                                     default: 0.0
    t.integer "interactions",                 limit: 8, default: 0
    t.decimal "ir",                                     default: 0.0
    t.decimal "internet_ar",                            default: 0.0
    t.decimal "internet_ir",                            default: 0.0
    t.decimal "click_affinity",                         default: 0.0
    t.decimal "action_affinity",                        default: 0.0
    t.decimal "engagement_affinity",                    default: 0.0
    t.decimal "internet_action_affinity",               default: 0.0
    t.decimal "internet_engagement_affinity",           default: 0.0
    t.decimal "performance_affinity",                   default: 0.0
  end

  create_table "audience_report_raw_data", force: true do |t|
    t.string  "name_l1"
    t.string  "name_l2"
    t.string  "name_l3"
    t.integer "imps",                         limit: 8
    t.integer "clicks",                       limit: 8
    t.decimal "ctr"
    t.integer "pi_actions",                   limit: 8
    t.integer "pc_actions",                   limit: 8
    t.decimal "pccr"
    t.integer "tot_actions",                  limit: 8
    t.decimal "ar"
    t.integer "interactions",                 limit: 8
    t.integer "total_interactions",           limit: 8
    t.decimal "ave_interaction_time"
    t.decimal "ir"
    t.decimal "tir"
    t.integer "views",                        limit: 8
    t.integer "full_views",                   limit: 8
    t.integer "atf_views",                    limit: 8
    t.decimal "vr"
    t.decimal "ave_view_time"
    t.integer "unique_users",                 limit: 8
    t.decimal "population_affinity"
    t.decimal "ctr_affinity"
    t.decimal "ar_affinity"
    t.decimal "pccr_affinity"
    t.integer "video_plays",                  limit: 8
    t.integer "p25_ad_completions",           limit: 8
    t.integer "p50_ad_completions",           limit: 8
    t.integer "p75_ad_completions",           limit: 8
    t.integer "p100_ad_completions",          limit: 8
    t.decimal "play_rate"
    t.decimal "completion_rate"
    t.integer "unmutes",                      limit: 8
    t.decimal "view_time"
    t.decimal "close_rate"
    t.decimal "mute_rate"
    t.decimal "mutes"
    t.decimal "pauses"
    t.integer "other_interactions",           limit: 8
    t.integer "replays",                      limit: 8
    t.integer "video_full_screen",            limit: 8
    t.integer "vast_redirect_errors",         limit: 8
    t.integer "audience_report_meta_data_id"
    t.decimal "cloud_composition"
    t.integer "pixel_population",                       default: 0
    t.decimal "internet_affinity",                      default: 0.0
    t.decimal "internet_cloud_composition",             default: 0.0
    t.decimal "segment_composition",                    default: 0.0
    t.decimal "internet_segment_composition",           default: 0.0
    t.decimal "internet_ar",                            default: 0.0
    t.decimal "internet_ir",                            default: 0.0
    t.decimal "click_affinity",                         default: 0.0
    t.decimal "action_affinity",                        default: 0.0
    t.decimal "engagement_affinity",                    default: 0.0
    t.decimal "internet_action_affinity",               default: 0.0
    t.decimal "internet_engagement_affinity",           default: 0.0
    t.decimal "performance_affinity",                   default: 0.0
  end

  create_table "audience_report_sections", force: true do |t|
    t.string   "name",                                   null: false
    t.integer  "provider_id"
    t.integer  "ui_sequence_no",     default: 0,         null: false
    t.integer  "audience_report_id",                     null: false
    t.integer  "user_id",                                null: false
    t.datetime "created_at",                             null: false
    t.datetime "updated_at",                             null: false
    t.boolean  "display_selected"
    t.string   "sort_field"
    t.boolean  "sort_ascending"
    t.integer  "segment_group_id"
    t.string   "universe",           default: "network", null: false
  end

  create_table "audience_report_sections_audience_report_segments", id: false, force: true do |t|
    t.integer "audience_report_section_id"
    t.integer "audience_report_segment_id"
  end

  create_table "audience_report_segment_groups", force: true do |t|
    t.string  "name",              null: false
    t.boolean "universe_complete", null: false
  end

  create_table "audience_report_segments", force: true do |t|
    t.string  "name",             null: false
    t.string  "display_name",     null: false
    t.integer "segment_group_id", null: false
    t.string  "combine_segment"
    t.integer "display_index"
  end

  create_table "audience_report_share_properties", force: true do |t|
    t.string   "password"
    t.integer  "report_id"
    t.integer  "user_id"
    t.datetime "created_at"
  end

  create_table "audience_reports", force: true do |t|
    t.string   "name",                                                                   null: false
    t.integer  "network_id",                                                             null: false
    t.integer  "user_id",                                                                null: false
    t.integer  "audience_report_meta_data_id"
    t.datetime "created_at",                                                             null: false
    t.datetime "updated_at",                                                             null: false
    t.string   "share_id"
    t.integer  "imps_filter_val",              limit: 8, default: 0,                     null: false
    t.string   "visible_columns"
    t.string   "selected_affinity",                      default: "population_affinity"
  end

  add_index "audience_reports", ["share_id"], name: "audience_reports_share_id_key", unique: true, using: :btree

  create_table "background_job_descriptions", force: true do |t|
    t.string   "type"
    t.string   "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "background_jobs", force: true do |t|
    t.integer  "network_id"
    t.integer  "scheduled_background_job_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "bad_ad_groups", id: false, force: true do |t|
    t.integer "ad_group_id"
  end

  create_table "behavioral_segments", force: true do |t|
    t.string  "name",                          null: false
    t.integer "channel_context_id",            null: false
    t.integer "frequency",                     null: false
    t.integer "bs_time",                       null: false
    t.string  "bs_type",            limit: 10
    t.integer "source_id",                     null: false
    t.string  "friendly_name",      limit: 50
  end

  add_index "behavioral_segments", ["channel_context_id"], name: "fki_behavioral_segments_channel_context_id", using: :btree
  add_index "behavioral_segments", ["name"], name: "behavioral_segments_name_unique", unique: true, using: :btree

  create_table "betty_ads_nov", id: false, force: true do |t|
    t.integer "id"
  end

  create_table "billing_ad_default_groups", id: false, force: true do |t|
    t.integer "order_id",            limit: 8,  null: false
    t.string  "alt_ad_id"
    t.string  "cost_type",           limit: 10
    t.float   "rate"
    t.integer "group_seq"
    t.integer "billing_ad_group_id", limit: 8
  end

  add_index "billing_ad_default_groups", ["order_id", "alt_ad_id", "cost_type", "rate"], name: "ad_def_grp_unique", unique: true, using: :btree

  create_table "billing_ad_groups", force: true do |t|
    t.string   "name",       limit: 280,                   null: false
    t.integer  "order_id"
    t.string   "cost_type",  limit: 10
    t.float    "rate"
    t.datetime "created_at",             default: "now()"
    t.datetime "updated_at",             default: "now()"
    t.datetime "end_date"
  end

  create_table "billing_addresses", force: true do |t|
    t.integer  "company_id"
    t.string   "phone",      limit: 25
    t.string   "email",      limit: 100
    t.string   "address",    limit: 750
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "disclaimer"
  end

  create_table "billing_contacts", force: true do |t|
    t.string   "name"
    t.string   "email"
    t.string   "phone",           null: false
    t.integer  "reach_client_id", null: false
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
    t.string   "address"
  end

  add_index "billing_contacts", ["name", "email"], name: "index_billing_contacts_on_name_and_email", unique: true, using: :btree
  add_index "billing_contacts", ["reach_client_id"], name: "index_billing_contacts_on_reach_client_id", using: :btree

  create_table "billing_periods", force: true do |t|
    t.integer  "network_id"
    t.integer  "month"
    t.integer  "year"
    t.date     "closed_at"
    t.boolean  "is_visible"
    t.boolean  "is_recon_closed"
    t.boolean  "is_new"
    t.string   "state",            default: "active", null: false
    t.datetime "state_changed_at"
    t.string   "state_changed_by"
    t.datetime "last_loaded_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "last_loaded_by"
  end

  add_index "billing_periods", ["network_id", "month", "year"], name: "billing_periods_idx", unique: true, using: :btree

  create_table "boris_test", id: false, force: true do |t|
    t.integer "c1",                 null: false
    t.string  "c2", default: "n/a", null: false
  end

  create_table "brand_categories", force: true do |t|
    t.string   "name",                         null: false
    t.string   "source_id",                    null: false
    t.datetime "created_at", default: "now()"
    t.datetime "updated_at", default: "now()"
  end

  add_index "brand_categories", ["name"], name: "index_brand_categories_on_name", unique: true, using: :btree
  add_index "brand_categories", ["source_id"], name: "index_brand_categories_on_source_id", unique: true, using: :btree

  create_table "brand_categories_networks", force: true do |t|
    t.integer  "brand_category_id",                   null: false
    t.integer  "network_id",                          null: false
    t.boolean  "banned",                              null: false
    t.datetime "created_at",        default: "now()"
    t.datetime "updated_at",        default: "now()"
  end

  add_index "brand_categories_networks", ["brand_category_id", "network_id"], name: "brand_category_network_unique", unique: true, using: :btree

  create_table "brands", force: true do |t|
    t.string   "name",                          null: false
    t.string   "source_id",                     null: false
    t.datetime "created_at",  default: "now()"
    t.datetime "updated_at",  default: "now()"
    t.integer  "category_id"
  end

  add_index "brands", ["source_id"], name: "index_brands_on_source_id", unique: true, using: :btree

  create_table "brands_networks", force: true do |t|
    t.integer "brand_id"
    t.integer "network_id"
    t.boolean "banned",     default: true, null: false
  end

  add_index "brands_networks", ["brand_id", "network_id"], name: "index_brands_networks_on_brand_id_and_network_id", unique: true, using: :btree
  add_index "brands_networks", ["brand_id"], name: "index_brands_networks_on_brand_id", using: :btree

  create_table "brands_to_update", id: false, force: true do |t|
    t.integer "id"
    t.string  "name"
    t.integer "category_id"
    t.string  "source_id"
  end

  create_table "browsers", force: true do |t|
    t.string   "name",                             null: false
    t.string   "source_id",                        null: false
    t.datetime "created_at",     default: "now()"
    t.datetime "updated_at",     default: "now()"
    t.integer  "data_source_id", default: 1,       null: false
  end

  add_index "browsers", ["source_id"], name: "index_browsers_on_source_id", unique: true, using: :btree

  create_table "btg_not_pub_users", id: false, force: true do |t|
    t.integer  "id"
    t.string   "account_login",         limit: 100
    t.string   "email"
    t.string   "phone_number"
    t.integer  "company_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "authority"
    t.string   "first_name",            limit: 40
    t.string   "last_name",             limit: 40
    t.string   "activation_code",       limit: 16
    t.string   "client_type",           limit: 50
    t.integer  "network_publisher_id"
    t.integer  "network_advertiser_id"
    t.string   "aa_url"
    t.datetime "last_login_at"
    t.integer  "agency_id"
  end

  create_table "btg_payouts", id: false, force: true do |t|
    t.integer "id"
    t.date    "end_date"
  end

  create_table "btg_users", id: false, force: true do |t|
    t.integer  "id"
    t.string   "account_login",         limit: 100
    t.string   "email"
    t.string   "phone_number"
    t.integer  "company_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "authority"
    t.string   "first_name",            limit: 40
    t.string   "last_name",             limit: 40
    t.string   "activation_code",       limit: 16
    t.string   "client_type",           limit: 50
    t.integer  "network_publisher_id"
    t.integer  "network_advertiser_id"
    t.string   "aa_url"
    t.datetime "last_login_at"
    t.integer  "agency_id"
  end

  create_table "business_types", force: true do |t|
    t.string   "category",   limit: 50
    t.integer  "network_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "business_types", ["network_id", "category"], name: "index_business_types_on_network_id_and_category", unique: true, using: :btree

  create_table "buy_types", force: true do |t|
    t.string "name", null: false
    t.string "code"
  end

  add_index "buy_types", ["code"], name: "index_buy_types_on_code", unique: true, using: :btree
  add_index "buy_types", ["name"], name: "index_buy_types_on_name", unique: true, using: :btree

  create_table "buyers", force: true do |t|
    t.string   "name",        null: false
    t.integer  "brand_id"
    t.integer  "amp_id",      null: false
    t.string   "source_id",   null: false
    t.integer  "buy_type_id"
    t.integer  "status"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "buyers", ["amp_id", "buy_type_id"], name: "index_buyers_on_amp_id_and_buy_type_id", using: :btree
  add_index "buyers", ["brand_id"], name: "index_buyers_on_brand_id", using: :btree

  create_table "change_logs", force: true do |t|
    t.integer  "network_id"
    t.integer  "user_id",      null: false
    t.integer  "parent_id",    null: false
    t.string   "parent_type",  null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "component",    null: false
    t.text     "changed_from"
    t.text     "changed_to"
  end

  create_table "channel_contexts", force: true do |t|
    t.string  "name",                                     null: false
    t.string  "type",          limit: 10
    t.integer "parent_id"
    t.string  "friendly_name"
    t.integer "source_id",                                null: false
    t.string  "ctx_group",     limit: 10
    t.boolean "disabled",                 default: false
  end

  add_index "channel_contexts", ["name"], name: "channel_contexts_name_key", unique: true, using: :btree
  add_index "channel_contexts", ["parent_id"], name: "index_channel_contexts_on_channel_context_id", using: :btree

  create_table "channel_contexts_context_groups", id: false, force: true do |t|
    t.integer "channel_context_id"
    t.integer "context_group_id"
  end

  add_index "channel_contexts_context_groups", ["channel_context_id"], name: "index_channel_contexts_context_groups_on_channel_context_id", using: :btree
  add_index "channel_contexts_context_groups", ["context_group_id"], name: "index_channel_contexts_context_groups_on_context_group_id", using: :btree

  create_table "channels", force: true do |t|
    t.integer  "network_id"
    t.string   "name",                       null: false
    t.string   "source_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "data_source_id", default: 1, null: false
  end

  add_index "channels", ["data_source_id", "source_id", "network_id"], name: "index_channels_on_trinity", unique: true, using: :btree

  create_table "channels_sites", force: true do |t|
    t.integer  "channel_id", null: false
    t.integer  "site_id",    null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "channels_zones", force: true do |t|
    t.integer  "channel_id", null: false
    t.integer  "zone_id",    null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "cities", force: true do |t|
    t.string  "name",                                       null: false
    t.string  "region_name",    limit: nil
    t.string  "dart_region_id", limit: nil
    t.string  "country_code",   limit: nil
    t.string  "source_id"
    t.integer "xfp_id",         limit: 8
    t.boolean "xfp_targetable",             default: false, null: false
  end

  create_table "cities_lineitems", id: false, force: true do |t|
    t.integer "city_id"
    t.integer "lineitem_id"
  end

  add_index "cities_lineitems", ["lineitem_id"], name: "index_cities_lineitems_on_lineitem_id", using: :btree

  create_table "city_targeting", id: false, force: true do |t|
    t.integer "ad_id"
    t.integer "city_id"
  end

  create_table "client_types", force: true do |t|
    t.string "name", null: false
  end

  create_table "companies", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "ctype"
    t.string   "style_swf_url",              limit: 256
    t.text     "disclaimer"
    t.integer  "dart_id",                    limit: 8,   default: 0,                                             null: false
    t.datetime "last_opportunity_import_at",             default: '2000-01-01 00:00:00'
    t.string   "currency",                               default: "USD"
    t.string   "dart_user"
    t.string   "dart_password"
    t.string   "server_name",                            default: "http://amp3.collective-media.net",            null: false
    t.integer  "server_port",                            default: 80,                                            null: false
    t.string   "brand_name"
    t.string   "background_color",                       default: "0xD9DBEB",                                    null: false
    t.string   "controlbar_color",                       default: "0xD4D4D4",                                    null: false
    t.string   "border_color",                           default: "0x006990",                                    null: false
    t.string   "widget_color",                           default: "0xD9DBEB",                                    null: false
    t.string   "net_prefix",                 limit: 20
    t.string   "salesforce_username"
    t.string   "salesforce_password"
    t.string   "salesforce_token"
    t.datetime "last_dart_sync_at",                      default: '2009-01-01 00:00:00',                         null: false
    t.boolean  "purge_subnetworks",                      default: false,                                         null: false
    t.string   "support_email"
    t.boolean  "salesforce_enabled",                     default: false,                                         null: false
    t.string   "amp2_url",                               default: "http://qa-ampapp1.collective-media.net/",     null: false
    t.string   "brighton_url",                           default: "http://qa-ampapp1.collective-media.net/",     null: false
    t.string   "collectivedb_url",                       default: "http://tbd.qacdb.collective-media.net/",      null: false
    t.string   "finance_url",                            default: "http://qa-cdb1.collective-media.net/",        null: false
    t.string   "remoting_url",                           default: "http://qa-ampapp1.collective-media.net/",     null: false
    t.string   "util_url",                               default: "http://qa-ampapp1.collective-media.net/",     null: false
    t.boolean  "auto_close_billing",                     default: false,                                         null: false
    t.boolean  "skip_notifications",                     default: false,                                         null: false
    t.string   "amts_url",                               default: "http://qa-amts.collective.com/",              null: false
    t.boolean  "afa",                                    default: false,                                         null: false
    t.boolean  "active",                                 default: true,                                          null: false
    t.integer  "tz_offset",                  limit: 2,   default: -4,                                            null: false
    t.string   "time_zone",                              default: "Eastern Time (US & Canada)",                  null: false
    t.string   "ssp_cdb_url",                            default: "http://tbd.qa-ssp-cdb.collective-media.net/", null: false
    t.string   "video_ad_size",              limit: 12,  default: "1x1",                                         null: false
    t.string   "ui_logo"
    t.string   "login_logo"
    t.string   "statement_logo"
    t.string   "stargate_url",                           default: "https://qa-stargate.collective.com"
    t.string   "network_type",                           default: "DFP",                                         null: false
    t.integer  "data_source_id",                         default: 1,                                             null: false
    t.boolean  "third_party",                            default: false,                                         null: false
    t.string   "aa_url",                                 default: "http://aan.collective-media.net/audience"
    t.string   "ampweb_url",                             default: "https://qa-aa.collective.com"
    t.string   "reach_ui_url",                           default: "https://qa-reach.collective.com"
  end

  create_table "companies_features", id: false, force: true do |t|
    t.integer "company_id", null: false
    t.integer "feature_id", null: false
  end

  add_index "companies_features", ["company_id"], name: "index_companies_features_on_company_id", using: :btree
  add_index "companies_features", ["feature_id"], name: "index_companies_features_on_feature_id", using: :btree

  create_table "companies_roles", id: false, force: true do |t|
    t.integer "company_id", null: false
    t.integer "role_id",    null: false
  end

  add_index "companies_roles", ["company_id"], name: "index_companies_roles_on_company_id", using: :btree
  add_index "companies_roles", ["role_id"], name: "index_companies_roles_on_role_id", using: :btree

  create_table "component_restrictions", force: true do |t|
    t.integer "company_id",                  null: false
    t.integer "component_id",                null: false
    t.boolean "read_only",    default: true
  end

  add_index "component_restrictions", ["company_id"], name: "index_component_restrictions_on_company_id", using: :btree
  add_index "component_restrictions", ["component_id"], name: "index_component_restrictions_on_component_id", using: :btree

  create_table "components", force: true do |t|
    t.string   "name"
    t.string   "description"
    t.integer  "feature_id",                            null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "flex_iden",     limit: 64
    t.string   "swf_url",       limit: 256
    t.string   "swf_icon_url",  limit: 256
    t.integer  "max_instances",             default: 1
  end

  create_table "components_roles", id: false, force: true do |t|
    t.integer "component_id", null: false
    t.integer "role_id",      null: false
  end

  add_index "components_roles", ["component_id"], name: "index_components_roles_on_component_id", using: :btree
  add_index "components_roles", ["role_id"], name: "index_components_roles_on_role_id", using: :btree

  create_table "connection_types", force: true do |t|
    t.string   "name",                             null: false
    t.string   "source_id",                        null: false
    t.datetime "created_at",     default: "now()"
    t.datetime "updated_at",     default: "now()"
    t.integer  "data_source_id", default: 1,       null: false
  end

  add_index "connection_types", ["source_id"], name: "index_connection_types_on_source_id", unique: true, using: :btree

  create_table "context_groups", force: true do |t|
    t.string "name"
    t.string "friendly_name"
  end

  add_index "context_groups", ["id"], name: "index_context_groups_on_id", using: :btree

  create_table "contexts", force: true do |t|
    t.string   "name"
    t.string   "friendly_name"
    t.string   "type"
    t.integer  "network_id"
    t.integer  "modified_by"
    t.integer  "telluride_id"
    t.integer  "cdb_id"
    t.text     "description"
    t.boolean  "inactive",                    default: false, null: false
    t.boolean  "targeting",                   default: true,  null: false
    t.boolean  "reporting",                   default: true,  null: false
    t.boolean  "forecasting",                 default: true,  null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.date     "flight_begin"
    t.date     "flight_end"
    t.text     "redirect_url",                default: "",    null: false
    t.string   "redirect_protocol", limit: 5
    t.integer  "advertiser_id"
  end

  add_index "contexts", ["cdb_id"], name: "index_contexts_on_cdb_id", using: :btree
  add_index "contexts", ["forecasting"], name: "index_contexts_on_forecasting", using: :btree
  add_index "contexts", ["inactive"], name: "index_contexts_on_inactive", using: :btree
  add_index "contexts", ["modified_by"], name: "index_contexts_on_modified_by", using: :btree
  add_index "contexts", ["name"], name: "index_contexts_on_name", unique: true, using: :btree
  add_index "contexts", ["network_id"], name: "index_contexts_on_network_id", using: :btree
  add_index "contexts", ["reporting"], name: "index_contexts_on_reporting", using: :btree
  add_index "contexts", ["targeting"], name: "index_contexts_on_targeting", using: :btree
  add_index "contexts", ["telluride_id"], name: "index_contexts_on_telluride_id", using: :btree
  add_index "contexts", ["type"], name: "index_contexts_on_type", using: :btree

  create_table "corr_ad_ids", id: false, force: true do |t|
    t.integer "ad_group_id"
  end

  create_table "countries", force: true do |t|
    t.string  "abbr",      limit: 2
    t.string  "name",      limit: 50, null: false
    t.string  "source_id"
    t.string  "other_id"
    t.integer "xfp_id",    limit: 8
  end

  add_index "countries", ["abbr"], name: "unique_country_abbr", unique: true, using: :btree
  add_index "countries", ["xfp_id"], name: "unique_country_xfp_id", unique: true, using: :btree

  create_table "country_targeting", id: false, force: true do |t|
    t.integer "ad_id"
    t.integer "country_id"
  end

  add_index "country_targeting", ["ad_id", "country_id"], name: "index_country_targeting_on_ad_id_and_country_id", using: :btree

  create_table "cpd_ad_impressions", force: true do |t|
    t.integer "network_id"
    t.integer "ad_id"
    t.integer "impressions"
    t.date    "date"
  end

  add_index "cpd_ad_impressions", ["network_id", "ad_id", "date"], name: "index_cpd_ad_impressions_on_network_id_and_ad_id_and_date", unique: true, using: :btree

  create_table "creative_previews", force: true do |t|
    t.integer  "creative_id"
    t.integer  "network_id"
    t.integer  "data_source_id"
    t.string   "source_id"
    t.text     "url"
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
    t.text     "dest_url"
  end

  add_index "creative_previews", ["creative_id"], name: "index_creative_previews_on_creative_id", unique: true, using: :btree

  create_table "creative_sets", force: true do |t|
    t.string   "name"
    t.string   "source_id"
    t.integer  "master_creative_id"
    t.string   "master_source_id"
    t.integer  "companion_creative_id"
    t.string   "companion_source_id"
    t.integer  "network_id",                        null: false
    t.integer  "data_source_id",        default: 2, null: false
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
  end

  create_table "creative_site_xrefs", force: true do |t|
    t.integer  "creative_id"
    t.integer  "site_id"
    t.integer  "status"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "company_id"
    t.integer  "dart_advertiser_id"
    t.integer  "ad_id"
  end

  create_table "creatives", force: true do |t|
    t.string   "name",                  limit: 256,              null: false
    t.integer  "network_advertiser_id",                          null: false
    t.string   "size",                  limit: 12,               null: false
    t.string   "source_id",                                      null: false
    t.integer  "width"
    t.integer  "height"
    t.string   "creative_type"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "source_ui_creative_id"
    t.integer  "network_id"
    t.integer  "data_source_id",                     default: 1, null: false
    t.string   "redirect_url",          limit: 1024
    t.text     "html_code"
  end

  add_index "creatives", ["data_source_id", "source_id", "network_id"], name: "index_creatives_on_trinity", unique: true, using: :btree
  add_index "creatives", ["network_advertiser_id"], name: "fki_creatives_network_advertiser_id", using: :btree

  create_table "cumulative_costs", force: true do |t|
    t.date    "date"
    t.float   "cost"
    t.integer "network_id"
  end

  create_table "currencies", force: true do |t|
    t.string "name"
  end

  create_table "custom_finance_report", id: false, force: true do |t|
    t.integer "ad_id",             limit: 8
    t.float   "booked"
    t.float   "imps"
    t.float   "clicks"
    t.float   "ctr"
    t.float   "pub_payout"
    t.float   "dp_payout"
    t.float   "rm_payout"
    t.float   "gross_rev"
    t.float   "gross_ecpm"
    t.float   "net_rev"
    t.float   "gross_margin"
    t.float   "completion_25"
    t.float   "completion_50"
    t.float   "completion_75"
    t.float   "completion_100"
    t.float   "complete_rate"
    t.float   "play_rate"
    t.float   "video_full_screen"
    t.float   "mutes"
    t.float   "mute_rate"
    t.float   "pauses"
    t.float   "video_replays"
    t.float   "video_stops"
  end

  create_table "d_eps", id: false, force: true do |t|
    t.integer "id"
    t.string  "name"
    t.integer "dp_id"
  end

  create_table "dart_activity_categories", id: false, force: true do |t|
    t.string  "spot_id"
    t.string  "activity_type_id"
    t.string  "activity_type"
    t.string  "activity_id"
    t.string  "activity_sub_type"
    t.string  "report_name"
    t.integer "tag_method_id"
    t.string  "source_id",         null: false
    t.integer "network_id",        null: false
    t.integer "data_source_id",    null: false
  end

  create_table "dart_ad_pricings", id: false, force: true do |t|
    t.string  "order_id",                                  null: false
    t.string  "ad_id",                                     null: false
    t.string  "pricing_type",   limit: 12,                 null: false
    t.float   "rate",                                      null: false
    t.integer "quantity",                                  null: false
    t.float   "value"
    t.boolean "is_flat_fee",               default: false, null: false
    t.integer "network_id",                                null: false
    t.integer "data_source_id",                            null: false
  end

  create_table "dart_ads", id: false, force: true do |t|
    t.string   "advertiser_id"
    t.string   "order_id",                                        null: false
    t.string   "ad_id",                                           null: false
    t.string   "status"
    t.string   "description",                                     null: false
    t.string   "alt_ad_id",          limit: 32
    t.string   "product_type",       limit: 64
    t.string   "ad_type",            limit: 32
    t.string   "jump_url",           limit: 1024
    t.string   "creative_size",      limit: 12
    t.datetime "start_date"
    t.datetime "end_date"
    t.float    "rate"
    t.string   "cost_type"
    t.integer  "network_id",                                      null: false
    t.integer  "data_source_id",                                  null: false
    t.string   "keyvalue_targeting", limit: nil
    t.integer  "quantity",           limit: 8
    t.float    "value"
    t.boolean  "is_flat_fee",                     default: false, null: false
  end

  create_table "dart_api_ads", id: false, force: true do |t|
    t.integer  "id",         limit: 8,  null: false
    t.datetime "start_date"
    t.datetime "end_date"
    t.string   "cost_type",  limit: 10
    t.float    "rate"
  end

  create_table "dart_api_orders", id: false, force: true do |t|
    t.integer  "id",          limit: 8, null: false
    t.datetime "start_date"
    t.datetime "end_date"
    t.float    "gross_value"
    t.float    "net_value"
    t.float    "cpm_rate"
    t.float    "cpc_rate"
    t.float    "cpd_rate"
    t.integer  "cpm_booked"
    t.integer  "cpc_booked"
    t.integer  "cpd_booked"
  end

  create_table "dart_app_users", id: false, force: true do |t|
    t.string  "dart_user_name",                 null: false
    t.string  "dart_user_pwd",                  null: false
    t.integer "company_id",                     null: false
    t.string  "company_net_prefix",             null: false
    t.integer "application_id",     default: 0
  end

  create_table "dart_app_users_backup", id: false, force: true do |t|
    t.string  "dart_user_name"
    t.string  "dart_user_pwd"
    t.integer "company_id"
    t.string  "company_net_prefix"
    t.integer "application_id"
  end

  create_table "dart_assignments", id: false, force: true do |t|
    t.string   "ad_id",                         null: false
    t.string   "creative_id"
    t.datetime "start_date"
    t.datetime "end_date"
    t.string   "rotation_type",    limit: 16
    t.integer  "weight_sequence"
    t.boolean  "uses_default_url"
    t.string   "click_url",        limit: 1024
    t.integer  "network_id"
    t.integer  "data_source_id"
  end

  create_table "dart_browsers", id: false, force: true do |t|
    t.string  "name",           null: false
    t.string  "source_id",      null: false
    t.integer "data_source_id", null: false
  end

  create_table "dart_connection_types", id: false, force: true do |t|
    t.string  "name",           null: false
    t.string  "comments"
    t.string  "source_id",      null: false
    t.integer "data_source_id", null: false
  end

  create_table "dart_creative_sets", id: false, force: true do |t|
    t.integer "id",                    limit: 8, null: false
    t.string  "name"
    t.integer "master_creative_id",    limit: 8
    t.integer "companion_creative_id", limit: 8
    t.integer "network_id",                      null: false
    t.integer "data_source_id",                  null: false
  end

  create_table "dart_creatives", id: false, force: true do |t|
    t.string  "advertiser_id"
    t.string  "creative_id",                        null: false
    t.string  "ui_creative_id"
    t.string  "name",                  limit: 256
    t.boolean "status"
    t.string  "creative_type"
    t.string  "creative_size",         limit: 12
    t.string  "image_url",             limit: 512
    t.integer "image_filesize"
    t.string  "click_url",             limit: 1024
    t.integer "version"
    t.integer "network_id",                         null: false
    t.integer "data_source_id",                     null: false
    t.text    "preview_url"
    t.text    "dest_url"
    t.text    "internal_redirect_url"
  end

  create_table "dart_designated_market_areas", id: false, force: true do |t|
    t.string  "name",           null: false
    t.string  "source_id",      null: false
    t.integer "data_source_id", null: false
  end

  create_table "dart_device_categories", id: false, force: true do |t|
    t.string  "name",           null: false
    t.string  "source_id",      null: false
    t.integer "data_source_id", null: false
  end

  create_table "dart_geo", id: false, force: true do |t|
    t.string  "cityname"
    t.string  "countrycode"
    t.integer "countryid"
    t.string  "countryname"
    t.integer "id"
    t.integer "metrocode"
    t.string  "metroname"
    t.string  "regioncode"
    t.integer "regionid"
    t.string  "regionname"
    t.boolean "targetable",  default: false, null: false
  end

  create_table "dart_geo_targetings", id: false, force: true do |t|
    t.integer "network_id"
    t.integer "source_ad_id"
    t.boolean "excluded",             default: false, null: false
    t.integer "source_geo_target_id"
  end

  create_table "dart_geo_targets", id: false, force: true do |t|
    t.integer "data_source_id",                   null: false
    t.integer "source_id",                        null: false
    t.integer "source_parent_id"
    t.string  "type",                             null: false
    t.string  "name"
    t.string  "country_code"
    t.boolean "targetable",       default: false, null: false
  end

  create_table "dart_key_vals", id: false, force: true do |t|
    t.string  "ad_id"
    t.string  "keyword"
    t.integer "ordinal"
    t.integer "network_id"
    t.integer "key_id"
    t.integer "val_id"
    t.string  "key_name"
    t.string  "val_name"
  end

  create_table "dart_network_advertisers", id: false, force: true do |t|
    t.string  "type"
    t.string  "spot_id"
    t.string  "advertiser_id",                     null: false
    t.string  "advertiser",        default: "N/A", null: false
    t.string  "alt_advertiser_id"
    t.string  "site_id"
    t.integer "network_id",                        null: false
    t.integer "data_source_id",                    null: false
  end

  create_table "dart_network_configs", id: false, force: true do |t|
    t.integer "network_id",                            null: false
    t.boolean "api_sync",              default: false
    t.boolean "ftp_sync",              default: false
    t.string  "ftp_user"
    t.string  "ftp_pass"
    t.boolean "appnexus_enabled",      default: false
    t.date    "xfp_conversion_date"
    t.string  "dt_bucket_name"
    t.boolean "assign_sales_channels", default: false, null: false
  end

  create_table "dart_operating_systems", id: false, force: true do |t|
    t.string  "name",           null: false
    t.string  "source_id",      null: false
    t.integer "data_source_id", null: false
  end

  create_table "dart_order_pricings", id: false, force: true do |t|
    t.string  "order_id",              null: false
    t.string  "name"
    t.float   "cpm_rate"
    t.integer "cpm_count"
    t.float   "cpm_value"
    t.float   "cpc_rate"
    t.integer "cpc_count"
    t.float   "cpc_value"
    t.float   "cpd_rate"
    t.integer "cpd_count"
    t.float   "cpd_value"
    t.float   "order_gross_price"
    t.float   "order_net_price"
    t.integer "order_total_add_ons"
    t.integer "order_total_discounts"
  end

  create_table "dart_orders", id: false, force: true do |t|
    t.string   "advertiser_id",             null: false
    t.string   "order_id",                  null: false
    t.string   "name",                      null: false
    t.string   "purchase_order", limit: 64
    t.datetime "start_date"
    t.datetime "end_date"
    t.integer  "trafficker_id"
    t.integer  "network_id",                null: false
    t.integer  "data_source_id",            null: false
  end

  create_table "dart_page_flight_costs", id: false, force: true do |t|
    t.string  "zone_id",                         null: false
    t.date    "effective_date"
    t.date    "end_date"
    t.integer "units",                 limit: 8
    t.float   "rate"
    t.string  "comments"
    t.float   "cost"
    t.string  "buy_section"
    t.integer "pricing_flag"
    t.integer "delivered_impressions"
    t.integer "delivered_clicks"
    t.integer "network_id",                      null: false
    t.integer "data_source_id",                  null: false
  end

  create_table "dart_sites", id: false, force: true do |t|
    t.string  "id",                     null: false
    t.string  "name",                   null: false
    t.string  "key_name"
    t.boolean "is_explicitly_targeted"
    t.string  "advertiser_id"
    t.integer "parent_id"
    t.integer "parent_site_id"
    t.integer "network_id",             null: false
    t.integer "data_source_id",         null: false
  end

  create_table "dart_subnetwork_advertisers", id: false, force: true do |t|
    t.string  "advertiser_id"
    t.string  "subnetwork_id"
    t.string  "name"
    t.integer "network_id"
    t.integer "data_source_id"
  end

  create_table "dart_targeted_key_values_not_used", id: false, force: true do |t|
    t.integer "ad_id",              null: false
    t.string  "keyword", limit: 80, null: false
    t.integer "ordinal",            null: false
  end

  create_table "dart_users", id: false, force: true do |t|
    t.integer "id"
    t.string  "name"
    t.string  "email"
    t.string  "role"
    t.integer "network_id",     null: false
    t.integer "data_source_id", null: false
  end

  create_table "dart_zones", id: false, force: true do |t|
    t.string  "zone_id",                        null: false
    t.string  "description",                    null: false
    t.boolean "explicitly_targeted"
    t.string  "group_name",          limit: 64
    t.string  "site_id",                        null: false
    t.string  "site_keyname",        limit: 64
    t.string  "order_id"
    t.string  "site_placement"
    t.string  "content_category"
    t.string  "strategy"
    t.date    "start_date"
    t.date    "end_date"
    t.string  "group_type"
    t.string  "pricing_type"
    t.string  "cap_cost"
    t.integer "purchase_qty",        limit: 8
    t.float   "purchase_cost"
    t.integer "flight_activated"
    t.string  "cpa_activity_id"
    t.string  "group_parent_id"
    t.integer "network_id",                     null: false
    t.integer "data_source_id",                 null: false
  end

  create_table "data_provider_monthly_minimum_payouts", force: true do |t|
    t.integer  "data_provider_id"
    t.float    "payout"
    t.integer  "month_id"
    t.integer  "year"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "network_id"
  end

  create_table "data_provider_payouts", force: true do |t|
    t.integer  "network_id"
    t.integer  "billing_period_id"
    t.integer  "segment_id"
    t.integer  "ad_id",                limit: 8
    t.date     "date"
    t.float    "payout"
    t.integer  "publisher_revenue_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "imps"
    t.float    "clicks"
  end

  add_index "data_provider_payouts", ["billing_period_id"], name: "index_data_provider_payouts_on_billing_period_id", using: :btree

  create_table "data_provider_payouts_4029", id: false, force: true do |t|
    t.integer  "id"
    t.integer  "network_id"
    t.integer  "billing_period_id"
    t.integer  "segment_id"
    t.integer  "ad_id",                limit: 8
    t.date     "date"
    t.float    "payout"
    t.integer  "publisher_revenue_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "imps"
    t.float    "clicks"
  end

  create_table "data_provider_payouts_august2013", id: false, force: true do |t|
    t.integer  "id"
    t.integer  "network_id"
    t.integer  "billing_period_id"
    t.integer  "segment_id"
    t.integer  "ad_id",                limit: 8
    t.date     "date"
    t.float    "payout"
    t.integer  "publisher_revenue_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "imps"
    t.float    "clicks"
  end

  create_table "data_provider_payouts_test", id: false, force: true do |t|
    t.integer  "network_id"
    t.integer  "billing_period_id"
    t.integer  "segment_id"
    t.integer  "ad_id",                limit: 8
    t.date     "date"
    t.float    "payout"
    t.integer  "publisher_revenue_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "imps"
    t.float    "clicks"
    t.integer  "id",                             default: "nextval('data_provider_payouts_test_id_seq'::regclass)", null: false
  end

  create_table "data_provider_temp", id: false, force: true do |t|
    t.string "kv",          limit: 20
    t.string "provider",    limit: 40
    t.string "category",    limit: 50
    t.string "sub_segment", limit: 100
    t.string "seg_name",    limit: 100
  end

  create_table "data_sharing_rules", force: true do |t|
    t.integer  "network_id",    null: false
    t.integer  "segment_id",    null: false
    t.integer  "modified_by"
    t.string   "friendly_name"
    t.boolean  "inactive"
    t.boolean  "targeting"
    t.boolean  "reporting"
    t.boolean  "forecasting"
    t.boolean  "first_look"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "disabled"
    t.boolean  "unavailable"
    t.boolean  "na"
  end

  add_index "data_sharing_rules", ["first_look"], name: "index_data_sharing_rules_on_first_look", using: :btree
  add_index "data_sharing_rules", ["forecasting"], name: "index_data_sharing_rules_on_forecasting", using: :btree
  add_index "data_sharing_rules", ["inactive"], name: "index_data_sharing_rules_on_inactive", using: :btree
  add_index "data_sharing_rules", ["modified_by"], name: "index_data_sharing_rules_on_modified_by", using: :btree
  add_index "data_sharing_rules", ["network_id", "segment_id"], name: "index_data_sharing_rules_on_network_id_and_segment_id", unique: true, using: :btree
  add_index "data_sharing_rules", ["reporting"], name: "index_data_sharing_rules_on_reporting", using: :btree
  add_index "data_sharing_rules", ["targeting"], name: "index_data_sharing_rules_on_targeting", using: :btree

  create_table "data_sources", force: true do |t|
    t.string   "name"
    t.string   "ident",      null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "data_sources", ["ident"], name: "index_data_sources_on_ident", unique: true, using: :btree

  create_table "datalogix_segments", id: false, force: true do |t|
    t.integer "id"
    t.string  "name"
    t.integer "dp_id"
  end

  create_table "datalogix_segments2", id: false, force: true do |t|
    t.integer "id"
    t.string  "name"
    t.integer "dp_id"
  end

  create_table "dco_ads", id: false, force: true do |t|
    t.integer "id"
    t.string  "name", limit: nil
  end

  create_table "deleted_ads_103112", id: false, force: true do |t|
    t.integer  "id"
    t.string   "description"
    t.integer  "order_id"
    t.string   "source_id"
    t.string   "ad_type",                   limit: 32
    t.string   "size",                      limit: 12
    t.float    "rate"
    t.string   "cost_type",                 limit: 10
    t.datetime "start_date"
    t.datetime "end_date"
    t.boolean  "delivered"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "designated_market_area_id"
    t.integer  "channel_id"
    t.integer  "site_region_target_id"
    t.integer  "tgt_type_id"
    t.boolean  "active"
    t.integer  "geo_type_id"
    t.integer  "mkt_type_id"
    t.boolean  "ad_group_verified"
    t.string   "alt_ad_id"
    t.integer  "priority"
    t.boolean  "site_targeting_included"
    t.integer  "ad_group_id",               limit: 8
    t.string   "keyvalue_targeting",        limit: 9120
    t.integer  "appnexus_id"
    t.integer  "network_id"
    t.integer  "data_source_id"
  end

  create_table "deleted_payouts", id: false, force: true do |t|
    t.integer  "id",                                                 null: false
    t.integer  "network_publisher_id"
    t.string   "creative_size",          limit: 128
    t.integer  "zone_id"
    t.float    "revenue_rate"
    t.string   "revenue_type",           limit: 8
    t.string   "slot_size",              limit: 12
    t.integer  "channel_context_id"
    t.integer  "network_advertiser_id"
    t.date     "start_date"
    t.date     "end_date"
    t.string   "z_site",                 limit: 50
    t.boolean  "full_regen_required"
    t.boolean  "numbers_regen_required"
    t.integer  "amp2_publisher_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "order_id"
    t.integer  "ad_id"
    t.integer  "segment_id"
    t.float    "min_cpm_rate"
    t.boolean  "after_var_cost",                                     null: false
    t.integer  "payout_type_id"
    t.integer  "network_id"
    t.integer  "data_provider_id"
    t.integer  "rich_media_type_id"
    t.integer  "parent_id"
    t.boolean  "is_parent_payout",                                   null: false
    t.boolean  "adj_report_only",                    default: false
    t.integer  "adj",                                default: 0
    t.integer  "adj_type",                           default: 0
    t.float    "adj_val"
    t.boolean  "apply_recon",                        default: false
    t.string   "type"
    t.integer  "payout_vendor_id"
  end

  create_table "designated_market_areas", force: true do |t|
    t.string  "name",           limit: 80,             null: false
    t.string  "source_id"
    t.integer "code"
    t.integer "data_source_id",            default: 1, null: false
  end

  add_index "designated_market_areas", ["source_id"], name: "index_designated_market_areas_on_source_id", using: :btree

  create_table "device_categories", force: true do |t|
    t.string   "name",                           null: false
    t.integer  "data_source_id",     default: 2, null: false
    t.string   "source_id"
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
    t.integer  "screen_category_id"
    t.string   "dt_name"
  end

  add_index "device_categories", ["dt_name"], name: "index_device_categories_on_dt_name", unique: true, using: :btree

  create_table "dfp_temp_orders_1113", id: false, force: true do |t|
    t.string "name"
    t.string "imp",    limit: 10
    t.string "clicks", limit: 10
  end

  create_table "dma_targeting", id: false, force: true do |t|
    t.integer "ad_id"
    t.integer "dma_id"
  end

  add_index "dma_targeting", ["ad_id", "dma_id"], name: "index_dma_targeting_on_ad_id_and_dma_id", using: :btree

  create_table "dmas_lineitems", id: false, force: true do |t|
    t.integer "lineitem_id",               null: false
    t.integer "designated_market_area_id", null: false
  end

  add_index "dmas_lineitems", ["lineitem_id", "designated_market_area_id"], name: "index_dmas_lineitems_on_lineitem_id_and_dma_id", using: :btree

  create_table "dmas_nielsen_campaigns", force: true do |t|
    t.integer "dma_code"
    t.integer "nielsen_campaign_id"
  end

  add_index "dmas_nielsen_campaigns", ["dma_code", "nielsen_campaign_id"], name: "unique_index_dma_code_and_nielsen_campaign_id", unique: true, using: :btree

  create_table "dmp_rules", force: true do |t|
    t.string   "name"
    t.text     "rule",                                            null: false
    t.integer  "segment_id",                                      null: false
    t.integer  "created_by"
    t.datetime "created_at"
    t.integer  "modified_by"
    t.datetime "updated_at"
    t.integer  "segment_expire",            default: 0
    t.string   "rule_status",    limit: 20, default: "Run Daily"
    t.datetime "last_run"
    t.text     "description",               default: "",          null: false
    t.integer  "network_id",                                      null: false
    t.date     "rule_start"
    t.date     "rule_end"
  end

  create_table "domains", force: true do |t|
    t.string   "name",       default: "collective.com", null: false
    t.datetime "created_at",                            null: false
    t.datetime "updated_at",                            null: false
  end

  add_index "domains", ["name"], name: "index_domains_on_name", unique: true, using: :btree

  create_table "dp_ids", id: false, force: true do |t|
    t.integer "ids"
  end

  create_table "dummy_zone", id: false, force: true do |t|
    t.integer "site_id"
    t.text    "zone_keyname"
    t.string  "z_site",       limit: 50
  end

  create_table "dummy_zones", id: false, force: true do |t|
    t.integer "site_id"
    t.text    "zone_keyname"
    t.string  "z_site",       limit: 50
  end

  create_table "dupe_rom_ads_2013_11_20", id: false, force: true do |t|
    t.integer  "id"
    t.string   "description"
    t.integer  "order_id"
    t.string   "source_id"
    t.string   "ad_type",                   limit: 32
    t.string   "size",                      limit: 12
    t.float    "rate"
    t.string   "cost_type",                 limit: 10
    t.datetime "start_date"
    t.datetime "end_date"
    t.boolean  "delivered"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "designated_market_area_id"
    t.integer  "channel_id"
    t.integer  "site_region_target_id"
    t.integer  "tgt_type_id"
    t.boolean  "active"
    t.integer  "geo_type_id"
    t.integer  "mkt_type_id"
    t.boolean  "ad_group_verified"
    t.string   "alt_ad_id"
    t.integer  "priority"
    t.boolean  "site_targeting_included"
    t.integer  "ad_group_id",               limit: 8
    t.string   "keyvalue_targeting",        limit: 32000
    t.integer  "appnexus_id"
    t.integer  "network_id"
    t.integer  "data_source_id"
    t.integer  "rate_type_id"
    t.integer  "media_type_id"
    t.integer  "io_lineitem_id"
    t.string   "nielsen_campaign_id"
  end

  create_table "duplicate_payouts_removed_2012_02_13", id: false, force: true do |t|
    t.integer  "id"
    t.integer  "network_publisher_id"
    t.string   "creative_size",          limit: 128
    t.integer  "zone_id"
    t.float    "revenue_rate"
    t.string   "revenue_type",           limit: 8
    t.string   "slot_size",              limit: 12
    t.integer  "channel_context_id"
    t.integer  "network_advertiser_id"
    t.date     "start_date"
    t.date     "end_date"
    t.string   "z_site",                 limit: 50
    t.boolean  "full_regen_required"
    t.boolean  "numbers_regen_required"
    t.integer  "amp2_publisher_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "order_id"
    t.integer  "ad_id"
    t.integer  "segment_id"
    t.float    "min_cpm_rate"
    t.boolean  "after_var_cost"
    t.integer  "payout_type_id"
    t.integer  "network_id"
    t.integer  "data_provider_id"
    t.integer  "rich_media_type_id"
    t.integer  "parent_id"
    t.boolean  "is_parent_payout"
    t.boolean  "adj_report_only"
    t.integer  "adj"
    t.integer  "adj_type"
    t.float    "adj_val"
    t.boolean  "apply_recon"
  end

  create_table "epscilon_segments", id: false, force: true do |t|
    t.string "name"
    t.float  "rate"
  end

  create_table "exchange_payouts", id: false, force: true do |t|
    t.string  "site_name",  limit: nil
    t.integer "site_id"
    t.string  "adv_name",   limit: nil
    t.integer "adv_id"
    t.date    "start_date"
    t.date    "end_date"
    t.float   "rate"
    t.string  "type",       limit: nil
  end

  create_table "exchange_payouts_1115", id: false, force: true do |t|
    t.string  "site_name",  limit: nil
    t.integer "site_id"
    t.string  "adv_name",   limit: nil
    t.integer "adv_id"
    t.date    "start_date"
    t.date    "end_date"
    t.float   "rate"
    t.string  "type",       limit: nil
  end

  create_table "exchange_payouts_backup", id: false, force: true do |t|
    t.string  "site_name",  limit: nil
    t.integer "site_id"
    t.string  "adv_name",   limit: nil
    t.integer "adv_id"
    t.date    "start_date"
    t.date    "end_date"
    t.float   "rate"
    t.string  "type",       limit: nil
  end

  create_table "features", force: true do |t|
    t.string   "name"
    t.string   "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "fee_types", id: false, force: true do |t|
    t.integer  "id",                     default: "nextval('fee_types_id_seq'::regclass)", null: false
    t.string   "name",       limit: 250
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "fees", force: true do |t|
    t.integer  "fee_type"
    t.integer  "network_id"
    t.date     "start_date"
    t.date     "end_date"
    t.float    "cpm"
    t.integer  "fee_type_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "forecasting_contexts", force: true do |t|
    t.string  "name",         limit: 45
    t.string  "display_name", limit: 100
    t.boolean "active"
    t.integer "company_id"
  end

  create_table "forecasting_multiplier", force: true do |t|
    t.integer "network_id",             null: false
    t.float   "min_forecast_value"
    t.float   "core_multiplier"
    t.float   "partial_ext_multiplier"
    t.float   "full_ext_multiplier"
  end

  create_table "forecasting_off_network_map", id: false, force: true do |t|
    t.integer "on_network_id",  null: false
    t.integer "off_network_id", null: false
  end

  create_table "forecasting_saved_criteria", force: true do |t|
    t.string  "name",       null: false
    t.text    "criteria",   null: false
    t.integer "user_id",    null: false
    t.integer "company_id", null: false
  end

  create_table "forecasting_segments", force: true do |t|
    t.string  "name",         limit: 100
    t.string  "display_name", limit: 100
    t.integer "company_id"
    t.boolean "active",                   default: true
  end

  create_table "format_types", force: true do |t|
    t.string   "category"
    t.integer  "network_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "format_types", ["network_id"], name: "index_format_types_on_network_id", using: :btree

  create_table "frequency_caps", force: true do |t|
    t.integer "ad_id"
    t.integer "cap_value"
    t.integer "time_value"
    t.integer "time_unit"
  end

  add_index "frequency_caps", ["ad_id"], name: "index_frequency_caps_on_ad_id", using: :btree

  create_table "geo_regions", force: true do |t|
    t.string "name",         null: false
    t.string "country_code"
    t.string "source_id"
    t.string "appnexus_id"
  end

  create_table "geo_targets", force: true do |t|
    t.integer  "data_source_id"
    t.integer  "source_id"
    t.integer  "source_parent_id"
    t.string   "type"
    t.string   "name"
    t.string   "country_code"
    t.boolean  "targetable",       default: false, null: false
    t.datetime "created_at",                       null: false
    t.datetime "updated_at",                       null: false
  end

  add_index "geo_targets", ["data_source_id", "source_id"], name: "index_geo_targets_on_data_source_id_and_source_id", unique: true, using: :btree

  create_table "geo_types", force: true do |t|
    t.string   "category",   limit: 100
    t.integer  "network_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "geo_types", ["network_id", "category"], name: "index_geo_types_on_network_id_and_category", unique: true, using: :btree

  create_table "hdfs_counts", id: false, force: true do |t|
    t.string  "name", limit: 50
    t.integer "imps"
  end

  create_table "ignored_records", force: true do |t|
    t.integer  "network_id"
    t.string   "table_name"
    t.string   "field"
    t.string   "value"
    t.string   "reason"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "data_source_id", default: 1, null: false
  end

  add_index "ignored_records", ["table_name", "data_source_id", "field", "value", "network_id"], name: "ignored_records_trinity", unique: true, using: :btree

  create_table "invalid_contexts", id: false, force: true do |t|
    t.integer  "times",      default: 1, null: false
    t.integer  "network_id",             null: false
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "invalid_contexts", ["network_id", "name"], name: "index_invalid_contexts_on_network_id_and_name", unique: true, using: :btree

  create_table "io_assets", force: true do |t|
    t.string   "asset_upload_name", null: false
    t.string   "asset_path",        null: false
    t.integer  "order_id"
    t.datetime "created_at",        null: false
    t.datetime "updated_at",        null: false
    t.string   "asset_type"
  end

  create_table "io_details", force: true do |t|
    t.string  "client_advertiser_name"
    t.integer "order_id",               null: false
    t.integer "media_contact_id",       null: false
    t.integer "billing_contact_id",     null: false
    t.integer "reach_client_id"
    t.integer "trafficking_contact_id"
    t.integer "sales_person_id"
    t.integer "account_manager_id"
    t.string  "state"
    t.string  "client_order_id"
    t.string  "sales_person_email"
    t.string  "sales_person_phone"
    t.string  "account_manager_email"
    t.string  "account_manager_phone"
  end

  add_index "io_details", ["account_manager_id"], name: "index_io_details_on_account_manager_id", using: :btree
  add_index "io_details", ["billing_contact_id"], name: "index_io_details_on_billing_contact_id", using: :btree
  add_index "io_details", ["media_contact_id"], name: "index_io_details_on_media_contact_id", using: :btree
  add_index "io_details", ["order_id"], name: "index_io_details_on_order_id", using: :btree
  add_index "io_details", ["reach_client_id"], name: "index_io_details_on_reach_client_id", using: :btree
  add_index "io_details", ["sales_person_id"], name: "index_io_details_on_sales_person_id", using: :btree
  add_index "io_details", ["state"], name: "index_io_details_on_state", using: :btree
  add_index "io_details", ["trafficking_contact_id"], name: "index_io_details_on_trafficking_contact_id", using: :btree

  create_table "io_lineitems", force: true do |t|
    t.string   "name",                 limit: 500,                 null: false
    t.boolean  "active",                           default: false, null: false
    t.datetime "start_date",                                       null: false
    t.datetime "end_date",                                         null: false
    t.integer  "volume",               limit: 8,   default: 0
    t.decimal  "rate",                             default: 0.0
    t.decimal  "value",                            default: 0.0
    t.integer  "order_id"
    t.datetime "created_at",                                       null: false
    t.datetime "updated_at",                                       null: false
    t.string   "ad_sizes"
    t.string   "nielsen_placement_id"
    t.integer  "user_id"
    t.string   "alt_ad_id"
    t.text     "keyvalue_targeting"
    t.text     "notes"
    t.string   "type"
    t.integer  "media_type_id"
    t.decimal  "buffer",                           default: 0.0
    t.string   "proposal_li_id"
  end

  create_table "issue_4807", id: false, force: true do |t|
    t.integer  "id"
    t.integer  "network_publisher_id"
    t.string   "creative_size",          limit: 128
    t.integer  "zone_id"
    t.float    "revenue_rate"
    t.string   "revenue_type",           limit: 8
    t.string   "slot_size",              limit: 12
    t.integer  "channel_context_id"
    t.integer  "network_advertiser_id"
    t.date     "start_date"
    t.date     "end_date"
    t.string   "z_site",                 limit: 50
    t.boolean  "full_regen_required"
    t.boolean  "numbers_regen_required"
    t.integer  "amp2_publisher_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "order_id"
    t.integer  "ad_id"
    t.integer  "segment_id"
    t.float    "min_cpm_rate"
    t.boolean  "after_var_cost"
    t.integer  "payout_type_id"
    t.integer  "network_id"
    t.integer  "data_provider_id"
    t.integer  "rich_media_type_id"
    t.integer  "parent_id"
    t.boolean  "is_parent_payout"
    t.boolean  "adj_report_only"
    t.integer  "adj"
    t.integer  "adj_type"
    t.float    "adj_val"
    t.boolean  "apply_recon"
  end

  create_table "issue_7200_sites", id: false, force: true do |t|
    t.integer  "id"
    t.integer  "network_publisher_id"
    t.string   "name"
    t.integer  "source_ad_server_id"
    t.string   "source_id"
    t.string   "source_advertiser_id"
    t.integer  "amp2_site_id"
    t.integer  "amp2_publisher_id"
    t.integer  "amp2_master_id"
    t.string   "keyname"
    t.integer  "subnetwork_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "active"
    t.integer  "site_type_id"
    t.integer  "network_id"
    t.boolean  "is_explicitly_targeted"
    t.integer  "data_source_id"
  end

  create_table "issue_7200_zones", id: false, force: true do |t|
    t.integer  "id"
    t.string   "keyname",                     limit: 200
    t.integer  "site_id"
    t.string   "site",                        limit: 64
    t.string   "context",                     limit: 40
    t.string   "source_id"
    t.integer  "section_id"
    t.boolean  "always_payout_flag"
    t.string   "z_site",                      limit: 50
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "active"
    t.integer  "zone_type_id"
    t.integer  "order_id"
    t.string   "site_placement"
    t.string   "content_category"
    t.string   "strategy"
    t.date     "start_date"
    t.date     "end_date"
    t.string   "group_type"
    t.string   "pricing_type"
    t.string   "cap_cost"
    t.integer  "purchase_qty",                limit: 8
    t.float    "purchase_cost"
    t.integer  "flight_activated"
    t.integer  "activity_category_id"
    t.string   "source_group_parent_id"
    t.string   "source_activity_category_id"
    t.integer  "parent_id"
    t.float    "cumulative_cost"
    t.integer  "network_id"
    t.integer  "data_source_id"
  end

  create_table "ixi_dp", id: false, force: true do |t|
    t.integer "data_provider_id"
    t.string  "data_provider"
    t.integer "segment_id"
    t.text    "segment"
    t.integer "payout_id"
    t.date    "payout_start_date"
    t.date    "payout_end_date"
    t.text    "revenue_rate"
    t.string  "revenue_type",      limit: nil
    t.float   "imp"
    t.float   "pub_payout"
    t.text    "description"
  end

  create_table "job_statuses", force: true do |t|
    t.string "name"
  end

  create_table "job_types", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "jobs", force: true do |t|
    t.integer  "user_id"
    t.integer  "job_type_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "job_status_id"
    t.text     "message"
    t.integer  "company_id"
  end

  create_table "lineitem_assignments", force: true do |t|
    t.integer  "io_lineitem_id",             null: false
    t.integer  "creative_id",                null: false
    t.datetime "start_date"
    t.datetime "end_date"
    t.integer  "network_id",                 null: false
    t.integer  "data_source_id", default: 1, null: false
  end

  add_index "lineitem_assignments", ["creative_id"], name: "index_lineitem_assignments_on_creative_id", using: :btree
  add_index "lineitem_assignments", ["io_lineitem_id", "creative_id"], name: "index_lineitem_assignments_on_io_lineitem_id_and_creative_id", using: :btree
  add_index "lineitem_assignments", ["io_lineitem_id"], name: "index_lineitem_assignments_on_io_lineitem_id", using: :btree

  create_table "lineitem_frequency_caps", force: true do |t|
    t.integer "io_lineitem_id"
    t.integer "cap_value"
    t.integer "time_value"
    t.integer "time_unit"
  end

  create_table "lineitem_geo_targetings", force: true do |t|
    t.integer  "lineitem_id"
    t.integer  "geo_target_id"
    t.integer  "source_geo_target_id"
    t.boolean  "excluded",             default: false, null: false
    t.integer  "network_id"
    t.datetime "created_at",                           null: false
    t.datetime "updated_at",                           null: false
  end

  add_index "lineitem_geo_targetings", ["lineitem_id", "geo_target_id"], name: "index_lineitem_geo_targetings_on_lineitem_id_and_geo_target_id", unique: true, using: :btree

  create_table "lineitem_video_assignments", force: true do |t|
    t.integer  "io_lineitem_id",                null: false
    t.integer  "video_creative_id",             null: false
    t.datetime "start_date"
    t.datetime "end_date"
    t.integer  "network_id",                    null: false
    t.integer  "data_source_id",    default: 1, null: false
  end

  add_index "lineitem_video_assignments", ["io_lineitem_id", "video_creative_id"], name: "index_on_li_id_and_video_creative_id", unique: true, using: :btree
  add_index "lineitem_video_assignments", ["io_lineitem_id"], name: "index_lineitem_video_assignments_on_io_lineitem_id", using: :btree
  add_index "lineitem_video_assignments", ["video_creative_id"], name: "index_lineitem_video_assignments_on_video_creative_id", using: :btree

  create_table "lineitems_reach_audience_groups", id: false, force: true do |t|
    t.integer "lineitem_id",             null: false
    t.integer "reach_audience_group_id", null: false
  end

  add_index "lineitems_reach_audience_groups", ["lineitem_id", "reach_audience_group_id"], name: "index_lineitems_reach_audience_groups_on_li_id_and_rag_id", using: :btree

  create_table "load_ads", id: false, force: true do |t|
    t.string "ad_source_id"
    t.string "order_source_id"
  end

  create_table "load_amp_dfp", id: false, force: true do |t|
    t.integer "amp_id"
    t.string  "dfp_id"
  end

  create_table "luid_test", id: false, force: true do |t|
    t.string "luid", limit: 50
  end

# Could not dump table "matviews" because of following StandardError
#   Unknown type 'name' for column 'mv_name'

  create_table "media_contacts", force: true do |t|
    t.string   "name",            null: false
    t.string   "phone",           null: false
    t.string   "email",           null: false
    t.integer  "reach_client_id", null: false
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
    t.string   "address"
  end

  add_index "media_contacts", ["name", "email"], name: "index_media_contacts_on_name_and_email", unique: true, using: :btree
  add_index "media_contacts", ["reach_client_id"], name: "index_media_contacts_on_reach_client_id", using: :btree

  create_table "media_types", force: true do |t|
    t.string   "category"
    t.integer  "network_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "media_types", ["category", "network_id"], name: "unique_media_types_categories", unique: true, using: :btree
  add_index "media_types", ["network_id"], name: "index_media_types_on_network_id", using: :btree

  create_table "member_primary_types", force: true do |t|
    t.string   "name",                         null: false
    t.datetime "created_at", default: "now()"
    t.datetime "updated_at", default: "now()"
  end

  add_index "member_primary_types", ["name"], name: "index_member_primary_types_on_name", unique: true, using: :btree

  create_table "members_networks", force: true do |t|
    t.integer  "member_id",                    null: false
    t.integer  "network_id",                   null: false
    t.boolean  "banned",                       null: false
    t.datetime "created_at", default: "now()"
    t.datetime "updated_at", default: "now()"
  end

  add_index "members_networks", ["member_id", "network_id"], name: "index_members_networks_on_member_id_and_network_id", unique: true, using: :btree
  add_index "members_networks", ["member_id"], name: "index_members_networks_on_member_id", using: :btree

  create_table "mkt_tmp", id: false, force: true do |t|
    t.string  "order_name"
    t.string  "mkt_cat",    limit: 50
    t.integer "order_id"
    t.integer "cat_id"
  end

  create_table "mkt_types", force: true do |t|
    t.string   "category",   limit: 50
    t.integer  "network_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "mkt_types", ["network_id", "category"], name: "index_mkt_types_on_network_id_and_category", unique: true, using: :btree

  create_table "mkt_update", id: false, force: true do |t|
    t.string  "order_name"
    t.string  "mkt_cat",    limit: 50
    t.integer "order_id"
    t.integer "cat_id"
  end

  create_table "mkt_update_2", id: false, force: true do |t|
    t.string "order_name"
    t.string "mkt_cat",    limit: 50
  end

  create_table "month_year_map", force: true do |t|
    t.integer "month_id"
    t.integer "year"
  end

  create_table "monthly_michelle", id: false, force: true do |t|
    t.integer "ad_id",            limit: 8
    t.float   "adserving_payout"
    t.float   "corporate_payout"
    t.float   "research_payout"
    t.float   "misc_payout"
    t.float   "pub_payout"
    t.float   "dp_payout"
    t.float   "rm_payout"
  end

  create_table "mv_opport_daily", id: false, force: true do |t|
    t.date    "realdate"
    t.string  "ext_opp_id"
    t.decimal "amount",         precision: 11, scale: 2
    t.decimal "exp_rev",        precision: 11, scale: 2
    t.integer "prob_pct"
    t.date    "opp_start_date"
    t.date    "opp_end_date"
    t.integer "flight_days"
    t.decimal "daily_amt"
    t.decimal "daily_exp_rev"
    t.decimal "daily_imps"
    t.float   "daily_rev"
    t.integer "network_id"
  end

  add_index "mv_opport_daily", ["realdate"], name: "mv_opport_daily_realdate", using: :btree

  create_table "network_advertiser_block_maps", force: true do |t|
    t.integer  "network_advertiser_block_id", null: false
    t.integer  "network_advertiser_id",       null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "network_advertiser_blocks", force: true do |t|
    t.string   "name",       null: false
    t.integer  "network_id", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "network_advertisers", force: true do |t|
    t.string   "name",                                null: false
    t.integer  "network_id",                          null: false
    t.integer  "source_ad_server_id", default: 1,     null: false
    t.string   "source_id",                           null: false
    t.integer  "subnetwork_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "default_advertiser",  default: false, null: false
    t.boolean  "active",              default: true,  null: false
    t.integer  "adv_cat_id"
    t.integer  "post_click_lookback", default: 0
    t.integer  "post_imps_lookback",  default: 0
    t.integer  "appnexus_id"
    t.integer  "data_source_id",      default: 1,     null: false
    t.integer  "advertiser_type_id"
  end

  add_index "network_advertisers", ["appnexus_id"], name: "unique_advertiser_appnexus_id", unique: true, using: :btree
  add_index "network_advertisers", ["data_source_id", "source_id", "network_id"], name: "index_network_advertisers_on_trinity", unique: true, using: :btree

  create_table "network_appnexus_configs", id: false, force: true do |t|
    t.integer  "amp_network_id",                                       null: false
    t.string   "default_ad_server_status",                             null: false
    t.string   "default_audit_type",                                   null: false
    t.string   "default_brand_status",                                 null: false
    t.string   "default_category_status",                              null: false
    t.string   "default_language_status",                              null: false
    t.string   "default_member_status",                                null: false
    t.string   "default_technical_attribute_status",                   null: false
    t.datetime "created_at",                         default: "now()"
    t.datetime "updated_at",                         default: "now()"
  end

  add_index "network_appnexus_configs", ["amp_network_id"], name: "index_network_appnexus_configs_on_amp_network_id", unique: true, using: :btree

  create_table "network_publishers", force: true do |t|
    t.integer  "network_id",                                  null: false
    t.string   "name",                                        null: false
    t.integer  "amp2_publisher_id"
    t.string   "amp2_zpub",         limit: 50
    t.integer  "parent_id"
    t.integer  "amp2_master_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "active",                       default: true, null: false
  end

  add_index "network_publishers", ["network_id", "amp2_publisher_id"], name: "network_publishers_source_id_unique", unique: true, using: :btree
  add_index "network_publishers", ["network_id"], name: "index_network_publishers_on_network_id", using: :btree

  create_table "network_segmaps", force: true do |t|
    t.integer "network_id",                                   null: false
    t.integer "segment_network_id",                           null: false
    t.integer "sequence",           limit: 2
    t.boolean "inactive",                     default: false, null: false
    t.string  "types"
    t.boolean "linked",                       default: false, null: false
    t.boolean "custom",                       default: false, null: false
  end

  add_index "network_segmaps", ["inactive"], name: "index_network_segmaps_on_inactive", using: :btree
  add_index "network_segmaps", ["network_id", "segment_network_id"], name: "index_network_segmaps_on_network_id_and_segment_network_id", unique: true, using: :btree

  create_table "network_types", force: true do |t|
    t.string "name", null: false
  end

  create_table "nielsen_campaigns", force: true do |t|
    t.string   "name",                        null: false
    t.string   "target_gender",               null: false
    t.string   "cost_type",                   null: false
    t.float    "value",         default: 0.0, null: false
    t.float    "trp_goal",      default: 0.0, null: false
    t.string   "start_age",                   null: false
    t.string   "end_age",                     null: false
    t.string   "source_id"
    t.integer  "user_id"
    t.integer  "order_id"
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
  end

  create_table "nielsen_deliveries", id: false, force: true do |t|
    t.date     "date",                                null: false
    t.integer  "source_campaign_id",                  null: false
    t.integer  "source_dma_id",                       null: false
    t.integer  "source_demographic_id",               null: false
    t.integer  "source_site_id",                      null: false
    t.decimal  "reach",                 default: 0.0, null: false
    t.decimal  "impressions",           default: 0.0, null: false
    t.integer  "uestimate"
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.string   "campaign_reference_id"
  end

  add_index "nielsen_deliveries", ["date"], name: "index_nielsen_deliveries_on_date", using: :btree
  add_index "nielsen_deliveries", ["source_campaign_id"], name: "index_nielsen_deliveries_on_source_campaign_id", using: :btree
  add_index "nielsen_deliveries", ["source_demographic_id"], name: "index_nielsen_deliveries_on_source_demographic_id", using: :btree
  add_index "nielsen_deliveries", ["source_dma_id"], name: "index_nielsen_deliveries_on_source_dma_id", using: :btree

  create_table "nielsen_deliveries_2014_01_01_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_02_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_03_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_04_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_05_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_06_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_07_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_08_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_09_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_10_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_11_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_12_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_13_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_14_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_15_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_16_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_17_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_18_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_19_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_20_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_21_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_22_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_23_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_deliveries_2014_01_24_202100158", id: false, force: true do |t|
    t.date     "date"
    t.integer  "source_campaign_id"
    t.integer  "source_dma_id"
    t.integer  "source_demographic_id"
    t.integer  "source_site_id"
    t.decimal  "reach"
    t.decimal  "impressions"
    t.integer  "uestimate"
    t.datetime "created_at"
    t.string   "campaign_reference_id"
  end

  create_table "nielsen_demographics", force: true do |t|
    t.integer  "source_id",    null: false
    t.integer  "start_age"
    t.integer  "end_age"
    t.string   "group_gender"
    t.string   "country"
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
  end

  add_index "nielsen_demographics", ["source_id"], name: "index_nielsen_demographics_on_source_id", unique: true, using: :btree

  create_table "nielsen_dma", force: true do |t|
    t.integer  "source_id",                 null: false
    t.string   "name"
    t.string   "country"
    t.integer  "designated_market_area_id"
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
  end

  add_index "nielsen_dma", ["source_id"], name: "index_nielsen_dma_on_source_id", unique: true, using: :btree

  create_table "nielsen_pricings", force: true do |t|
    t.decimal  "cpp",         default: 0.0, null: false
    t.decimal  "trp",         default: 0.0, null: false
    t.integer  "lineitem_id"
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
  end

  create_table "nielsen_site", id: false, force: true do |t|
    t.integer  "id",         null: false
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "nielsen_site_temp", id: false, force: true do |t|
    t.integer  "id"
    t.string   "name"
    t.datetime "created_at"
  end

  create_table "nielsen_sites", force: true do |t|
    t.integer  "source_id",  null: false
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "nielsen_sites", ["source_id"], name: "index_nielsen_sites_on_source_id", unique: true, using: :btree

  create_table "nielsen_stats", id: false, force: true do |t|
    t.date     "date"
    t.integer  "count", limit: 8
    t.datetime "now"
  end

  create_table "objectives", force: true do |t|
    t.string   "name"
    t.integer  "network_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "objectives", ["network_id"], name: "index_objectives_on_network_id", using: :btree

  create_table "observed_values", force: true do |t|
    t.integer  "registered_key_id"
    t.string   "value"
    t.datetime "created_at",        null: false
    t.datetime "updated_at",        null: false
  end

  add_index "observed_values", ["registered_key_id", "value"], name: "index_observed_values_on_registered_key_id_and_value", unique: true, using: :btree
  add_index "observed_values", ["registered_key_id"], name: "index_observed_values_on_registered_key_id", using: :btree

  create_table "operating_systems", force: true do |t|
    t.string   "name",           null: false
    t.string   "source_id"
    t.integer  "data_source_id"
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
  end

  add_index "operating_systems", ["data_source_id", "source_id"], name: "index_operating_systems_on_data_source_id_and_source_id", unique: true, using: :btree

# Could not dump table "opportunities" because of following StandardError
#   Unknown type 'opp_type' for column 'opp_type'

# Could not dump table "opportunity_accounts" because of following StandardError
#   Unknown type 'opp_account_type' for column 'account_type'

# Could not dump table "opportunity_line_items" because of following StandardError
#   Unknown type 'opp_rate_type' for column 'rate_type'

# Could not dump table "opps_test" because of following StandardError
#   Unknown type 'opp_type' for column 'opp_type'

  create_table "optimization_activities", force: true do |t|
    t.string   "type"
    t.integer  "sub_type_id"
    t.integer  "optimization_id", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "optimization_assignments", force: true do |t|
    t.integer  "optimization_id", null: false
    t.integer  "segment_id",      null: false
    t.integer  "tier"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "optimization_global_settings", force: true do |t|
    t.integer "delivery_lookback_max_days"
    t.float   "delivery_lookback_flight_period"
    t.integer "performance_lookback_max_days"
    t.float   "performance_lookback_flight_period"
    t.integer "company_id"
  end

  create_table "optimization_logs", force: true do |t|
    t.datetime "optimized_datetime"
    t.integer  "order_id"
    t.integer  "dart_order_id"
    t.integer  "dart_ad_id"
    t.integer  "old_imps"
    t.integer  "new_imps"
    t.string   "error_message"
  end

  add_index "optimization_logs", ["optimized_datetime", "order_id"], name: "index_optimization_logs_on_optimized_datetime_and_order_id", using: :btree

  create_table "optimization_notifications", force: true do |t|
    t.integer  "optimization_id",                null: false
    t.text     "message"
    t.datetime "run_date"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "notification_count", default: 0, null: false
  end

  create_table "optimization_order_settings", force: true do |t|
    t.integer "order_id"
    t.integer "company_id"
    t.integer "user_id"
    t.integer "mode"
    t.integer "metric"
    t.integer "dimension"
    t.boolean "active"
  end

  create_table "order_activity_logs", force: true do |t|
    t.integer  "order_id",         null: false
    t.text     "note"
    t.integer  "activity_type_id", null: false
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
  end

  create_table "order_notes", force: true do |t|
    t.text     "note"
    t.integer  "order_id"
    t.integer  "user_id"
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
    t.boolean  "sent",       default: false
  end

  create_table "order_temp", id: false, force: true do |t|
    t.string "name"
  end

  create_table "orders", force: true do |t|
    t.string   "name",                                              null: false
    t.integer  "network_advertiser_id",                             null: false
    t.string   "source_id",                                         null: false
    t.integer  "sales_person_id"
    t.integer  "cpm_booked",            limit: 8
    t.integer  "cpc_booked",            limit: 8
    t.boolean  "payout_flag",                     default: true,    null: false
    t.float    "cpm_rate"
    t.float    "cpc_rate"
    t.float    "gross_value"
    t.integer  "agency_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "sales_office_id"
    t.integer  "region_id"
    t.boolean  "active",                          default: true,    null: false
    t.integer  "business_type_id"
    t.integer  "product_type_id"
    t.datetime "start_date"
    t.datetime "end_date"
    t.integer  "appnexus_id"
    t.boolean  "auto_calibrate",                  default: false,   null: false
    t.boolean  "io_revised",                      default: false,   null: false
    t.integer  "network_id"
    t.integer  "data_source_id",                  default: 1,       null: false
    t.integer  "recon_status"
    t.datetime "last_modified",                   default: "now()", null: false
    t.integer  "user_id"
    t.integer  "sales_channel_id"
    t.string   "trafficker_email"
  end

  add_index "orders", ["appnexus_id"], name: "unique_order_appnexus_id", unique: true, using: :btree
  add_index "orders", ["data_source_id", "source_id", "network_id"], name: "index_orders_on_trinity", unique: true, using: :btree
  add_index "orders", ["network_advertiser_id"], name: "fki_orders_network_advertiser_id", using: :btree

  create_table "p_r_dedup", id: false, force: true do |t|
    t.integer  "id"
    t.integer  "network_publisher_id"
    t.string   "creative_size",          limit: 128
    t.integer  "zone_id"
    t.float    "revenue_rate"
    t.string   "revenue_type",           limit: 8
    t.string   "slot_size",              limit: 12
    t.integer  "channel_context_id"
    t.integer  "network_advertiser_id"
    t.date     "start_date"
    t.date     "end_date"
    t.string   "z_site",                 limit: 50
    t.boolean  "full_regen_required"
    t.boolean  "numbers_regen_required"
    t.integer  "amp2_publisher_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "order_id"
    t.integer  "ad_id"
  end

  create_table "p_r_dups", id: false, force: true do |t|
    t.integer  "id"
    t.integer  "network_publisher_id"
    t.string   "creative_size",          limit: 128
    t.integer  "zone_id"
    t.float    "revenue_rate"
    t.string   "revenue_type",           limit: 8
    t.string   "slot_size",              limit: 12
    t.integer  "channel_context_id"
    t.integer  "network_advertiser_id"
    t.date     "start_date"
    t.date     "end_date"
    t.string   "z_site",                 limit: 50
    t.boolean  "full_regen_required"
    t.boolean  "numbers_regen_required"
    t.integer  "amp2_publisher_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "order_id"
    t.integer  "ad_id"
  end

  create_table "p_r_ids", id: false, force: true do |t|
    t.integer "id"
  end

  create_table "p_r_test", id: false, force: true do |t|
    t.integer  "id"
    t.integer  "network_publisher_id"
    t.string   "creative_size",          limit: 128
    t.integer  "zone_id"
    t.float    "revenue_rate"
    t.string   "revenue_type",           limit: 8
    t.string   "slot_size",              limit: 12
    t.integer  "channel_context_id"
    t.integer  "network_advertiser_id"
    t.date     "start_date"
    t.date     "end_date"
    t.string   "z_site",                 limit: 50
    t.boolean  "full_regen_required"
    t.boolean  "numbers_regen_required"
    t.integer  "amp2_publisher_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "order_id"
    t.integer  "ad_id"
    t.string   "name",                   limit: 200
    t.string   "site_source_id",         limit: 20
    t.string   "adv_source_id",          limit: 20
    t.string   "ord_source_id",          limit: 20
    t.string   "ad_source_id",           limit: 20
  end

  create_table "page_flight_costs", force: true do |t|
    t.string   "source_id",                                   null: false
    t.integer  "zone_id",                                     null: false
    t.date     "effective_date"
    t.date     "end_date"
    t.integer  "units",                 limit: 8
    t.float    "rate"
    t.string   "comments"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "cost"
    t.string   "buy_section"
    t.integer  "pricing_flag"
    t.integer  "delivered_impressions"
    t.integer  "delivered_clicks"
    t.integer  "data_source_id",                  default: 1, null: false
    t.integer  "network_id"
  end

  add_index "page_flight_costs", ["data_source_id", "source_id", "network_id"], name: "index_page_flight_costs_on_trinity", using: :btree

  create_table "password_requests", force: true do |t|
    t.integer  "user_id",                                      null: false
    t.string   "request_code",      limit: 40
    t.datetime "expires_at"
    t.boolean  "redirect_to_admin",            default: false, null: false
  end

  create_table "payout_types", force: true do |t|
    t.string   "name"
    t.string   "code"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "payout_vendors", force: true do |t|
    t.string   "name"
    t.integer  "network_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "type"
  end

  add_index "payout_vendors", ["type"], name: "index_payout_vendors_on_type", using: :btree

  create_table "pid_test", id: false, force: true do |t|
    t.string "pid", limit: 50
  end

  create_table "pixel_groups", force: true do |t|
    t.string   "name"
    t.string   "friendly_name"
    t.integer  "network_id"
    t.integer  "modified_by"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "pixel_groups", ["friendly_name", "network_id"], name: "index_pixel_groups_on_friendly_name_and_network_id", unique: true, using: :btree
  add_index "pixel_groups", ["modified_by"], name: "index_pixel_groups_on_modified_by", using: :btree
  add_index "pixel_groups", ["name", "network_id"], name: "index_pixel_groups_on_name_and_network_id", unique: true, using: :btree
  add_index "pixel_groups", ["name"], name: "index_pixel_groups_on_name", using: :btree
  add_index "pixel_groups", ["network_id"], name: "index_pixel_groups_on_network_id", using: :btree

  create_table "pixel_groups_pixels", id: false, force: true do |t|
    t.integer "pixel_group_id"
    t.integer "pixel_id"
  end

  add_index "pixel_groups_pixels", ["pixel_group_id"], name: "index_pixel_groups_pixels_on_pixel_group_id", using: :btree
  add_index "pixel_groups_pixels", ["pixel_id", "pixel_group_id"], name: "index_pixel_groups_pixels_on_pixel_id_and_pixel_group_id", unique: true, using: :btree
  add_index "pixel_groups_pixels", ["pixel_id"], name: "index_pixel_groups_pixels_on_pixel_id", using: :btree

  create_table "platform_members", force: true do |t|
    t.string   "name",                                     null: false
    t.string   "source_id",                                null: false
    t.integer  "member_primary_type_id",                   null: false
    t.datetime "created_at",             default: "now()"
    t.datetime "updated_at",             default: "now()"
  end

  add_index "platform_members", ["source_id"], name: "index_platform_members_on_source_id", unique: true, using: :btree

  create_table "pricing_exception_notes", force: true do |t|
    t.integer  "pricing_exception_id",                 null: false
    t.string   "external_id",                          null: false
    t.string   "title"
    t.text     "body"
    t.boolean  "attachment",           default: false
    t.datetime "created_at",                           null: false
    t.datetime "updated_at",                           null: false
    t.string   "created_by"
  end

  create_table "pricing_exceptions", force: true do |t|
    t.integer  "network_id",                                                  null: false
    t.integer  "opportunity_id",                                              null: false
    t.integer  "amp_order_id"
    t.string   "external_id",                                                 null: false
    t.string   "name",                                                        null: false
    t.string   "approval_status"
    t.text     "gross_ecpm_for_exception"
    t.text     "additional_non_std_restrictions"
    t.boolean  "legacy_deal"
    t.string   "legacy_amp_margin"
    t.boolean  "rm_included"
    t.decimal  "cog_for_collective",                 precision: 11, scale: 2
    t.decimal  "bonus_impressions"
    t.text     "reason_for_request"
    t.string   "additional_parameters"
    t.decimal  "cpm_for_additional_params",          precision: 11, scale: 2
    t.string   "additional_research_and_cost_info"
    t.boolean  "targeting_sold_incs_3rd_party_data"
    t.boolean  "expandable_ads"
    t.datetime "deleted_on"
    t.datetime "created_at",                                                  null: false
    t.datetime "updated_at",                                                  null: false
    t.string   "created_by"
    t.string   "last_modified_by"
    t.date     "rfp_due_date"
    t.decimal  "cpm_for_additional_parameters"
    t.string   "best_contact"
  end

  create_table "product_types", force: true do |t|
    t.string   "name"
    t.integer  "network_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "products", force: true do |t|
    t.integer  "network_id",                     null: false
    t.string   "name",       default: "Unknown", null: false
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
  end

  add_index "products", ["network_id", "name"], name: "index_products_on_network_id_and_name", unique: true, using: :btree

  create_table "pub_payouts", id: false, force: true do |t|
    t.integer  "id"
    t.integer  "network_publisher_id"
    t.string   "creative_size",          limit: 128
    t.integer  "zone_id"
    t.float    "revenue_rate"
    t.string   "revenue_type",           limit: 8
    t.string   "slot_size",              limit: 12
    t.integer  "channel_context_id"
    t.integer  "network_advertiser_id"
    t.date     "start_date"
    t.date     "end_date"
    t.string   "z_site",                 limit: 50
    t.boolean  "full_regen_required"
    t.boolean  "numbers_regen_required"
    t.integer  "amp2_publisher_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "order_id"
    t.integer  "ad_id"
    t.integer  "segment_id"
    t.float    "min_cpm_rate"
    t.boolean  "after_var_cost"
    t.integer  "payout_type_id"
    t.integer  "network_id"
    t.integer  "data_provider_id"
    t.integer  "rich_media_type_id"
    t.integer  "parent_id"
    t.boolean  "is_parent_payout"
  end

  create_table "pub_rev_20130109", id: false, force: true do |t|
    t.integer  "id"
    t.integer  "network_publisher_id"
    t.string   "creative_size",          limit: 128
    t.integer  "zone_id"
    t.float    "revenue_rate"
    t.string   "revenue_type",           limit: 8
    t.string   "slot_size",              limit: 12
    t.integer  "channel_context_id"
    t.integer  "network_advertiser_id"
    t.date     "start_date"
    t.date     "end_date"
    t.string   "z_site",                 limit: 50
    t.boolean  "full_regen_required"
    t.boolean  "numbers_regen_required"
    t.integer  "amp2_publisher_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "order_id"
    t.integer  "ad_id"
    t.integer  "segment_id"
    t.float    "min_cpm_rate"
    t.boolean  "after_var_cost"
    t.integer  "payout_type_id"
    t.integer  "network_id"
    t.integer  "data_provider_id"
    t.integer  "rich_media_type_id"
    t.integer  "parent_id"
    t.boolean  "is_parent_payout"
    t.boolean  "adj_report_only"
    t.integer  "adj"
    t.integer  "adj_type"
    t.float    "adj_val"
    t.boolean  "apply_recon"
  end

  create_table "pub_rev_66", id: false, force: true do |t|
    t.integer  "id"
    t.integer  "network_publisher_id"
    t.string   "creative_size",          limit: 128
    t.integer  "zone_id"
    t.float    "revenue_rate"
    t.string   "revenue_type",           limit: 8
    t.string   "slot_size",              limit: 12
    t.integer  "channel_context_id"
    t.integer  "network_advertiser_id"
    t.date     "start_date"
    t.date     "end_date"
    t.string   "z_site",                 limit: 50
    t.boolean  "full_regen_required"
    t.boolean  "numbers_regen_required"
    t.integer  "amp2_publisher_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "order_id"
    t.integer  "ad_id"
    t.integer  "segment_id"
    t.float    "min_cpm_rate"
    t.boolean  "after_var_cost"
    t.integer  "payout_type_id"
    t.integer  "network_id"
    t.integer  "data_provider_id"
    t.integer  "rich_media_type_id"
    t.integer  "parent_id"
    t.boolean  "is_parent_payout"
  end

  create_table "pub_template", id: false, force: true do |t|
    t.float    "revenue_rate"
    t.string   "revenue_type", limit: 8
    t.datetime "start_date"
  end

  create_table "publisher_monthly_minimum_payouts", force: true do |t|
    t.integer  "network_publisher_id"
    t.float    "payout"
    t.integer  "month_id"
    t.integer  "year"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "network_id"
  end

  create_table "publisher_revenues", force: true do |t|
    t.integer  "network_publisher_id"
    t.string   "creative_size",          limit: 128
    t.integer  "zone_id"
    t.float    "revenue_rate"
    t.string   "revenue_type",           limit: 8
    t.string   "slot_size",              limit: 12
    t.integer  "channel_context_id"
    t.integer  "network_advertiser_id"
    t.date     "start_date"
    t.date     "end_date"
    t.string   "z_site",                 limit: 50
    t.boolean  "full_regen_required"
    t.boolean  "numbers_regen_required"
    t.integer  "amp2_publisher_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "order_id"
    t.integer  "ad_id"
    t.integer  "segment_id"
    t.float    "min_cpm_rate"
    t.boolean  "after_var_cost",                     default: false, null: false
    t.integer  "payout_type_id"
    t.integer  "network_id"
    t.integer  "data_provider_id"
    t.integer  "rich_media_type_id"
    t.integer  "parent_id",                          default: 0,     null: false
    t.boolean  "is_parent_payout",                   default: false, null: false
    t.boolean  "adj_report_only",                    default: false
    t.integer  "adj",                                default: 0
    t.integer  "adj_type",                           default: 0
    t.float    "adj_val"
    t.boolean  "apply_recon",                        default: false
    t.string   "type"
    t.integer  "payout_vendor_id"
  end

  add_index "publisher_revenues", ["ad_id"], name: "ad_id_idx", using: :btree
  add_index "publisher_revenues", ["network_id"], name: "network_id_idx", using: :btree
  add_index "publisher_revenues", ["network_publisher_id"], name: "index_publisher_revenues_on_network_publisher_id", using: :btree
  add_index "publisher_revenues", ["payout_type_id"], name: "payout_type_id_idx", using: :btree
  add_index "publisher_revenues", ["payout_vendor_id"], name: "index_publisher_revenues_on_payout_vendor_id", using: :btree
  add_index "publisher_revenues", ["type"], name: "index_publisher_revenues_on_type", using: :btree
  add_index "publisher_revenues", ["z_site"], name: "index_publisher_revenues_on_z_site", using: :btree

  create_table "publisher_revenues_103112", id: false, force: true do |t|
    t.integer  "id",                                                 null: false
    t.integer  "network_publisher_id"
    t.string   "creative_size",          limit: 128
    t.integer  "zone_id"
    t.float    "revenue_rate"
    t.string   "revenue_type",           limit: 8
    t.string   "slot_size",              limit: 12
    t.integer  "channel_context_id"
    t.integer  "network_advertiser_id"
    t.date     "start_date"
    t.date     "end_date"
    t.string   "z_site",                 limit: 50
    t.boolean  "full_regen_required"
    t.boolean  "numbers_regen_required"
    t.integer  "amp2_publisher_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "order_id"
    t.integer  "ad_id"
    t.integer  "segment_id"
    t.float    "min_cpm_rate"
    t.boolean  "after_var_cost",                     default: false, null: false
    t.integer  "payout_type_id"
    t.integer  "network_id"
    t.integer  "data_provider_id"
    t.integer  "rich_media_type_id"
    t.integer  "parent_id",                          default: 0
    t.boolean  "is_parent_payout",                   default: false, null: false
    t.boolean  "adj_report_only",                    default: false
    t.integer  "adj",                                default: 0
    t.integer  "adj_type",                           default: 0
    t.float    "adj_val"
    t.boolean  "apply_recon",                        default: false
  end

  create_table "publisher_revenues_cleanup", id: false, force: true do |t|
    t.integer  "id"
    t.integer  "network_publisher_id"
    t.string   "creative_size",          limit: 128
    t.integer  "zone_id"
    t.float    "revenue_rate"
    t.string   "revenue_type",           limit: 8
    t.string   "slot_size",              limit: 12
    t.integer  "channel_context_id"
    t.integer  "network_advertiser_id"
    t.date     "start_date"
    t.date     "end_date"
    t.string   "z_site",                 limit: 50
    t.boolean  "full_regen_required"
    t.boolean  "numbers_regen_required"
    t.integer  "amp2_publisher_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "order_id"
    t.integer  "ad_id"
    t.integer  "segment_id"
    t.float    "min_cpm_rate"
    t.boolean  "after_var_cost"
    t.integer  "payout_type_id"
    t.integer  "network_id"
    t.integer  "data_provider_id"
    t.integer  "rich_media_type_id"
    t.integer  "parent_id"
    t.boolean  "is_parent_payout"
    t.boolean  "adj_report_only"
    t.integer  "adj"
    t.integer  "adj_type"
    t.float    "adj_val"
    t.boolean  "apply_recon"
    t.string   "type"
    t.integer  "payout_vendor_id"
  end

  create_table "publisher_revenues_dp_adsize", id: false, force: true do |t|
    t.integer  "id"
    t.integer  "network_publisher_id"
    t.string   "creative_size",          limit: 128
    t.integer  "zone_id"
    t.float    "revenue_rate"
    t.string   "revenue_type",           limit: 8
    t.string   "slot_size",              limit: 12
    t.integer  "channel_context_id"
    t.integer  "network_advertiser_id"
    t.date     "start_date"
    t.date     "end_date"
    t.string   "z_site",                 limit: 50
    t.boolean  "full_regen_required"
    t.boolean  "numbers_regen_required"
    t.integer  "amp2_publisher_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "order_id"
    t.integer  "ad_id"
    t.integer  "segment_id"
    t.float    "min_cpm_rate"
    t.boolean  "after_var_cost"
    t.integer  "payout_type_id"
    t.integer  "network_id"
    t.integer  "data_provider_id"
    t.integer  "rich_media_type_id"
    t.integer  "parent_id"
    t.boolean  "is_parent_payout"
    t.boolean  "adj_report_only"
    t.integer  "adj"
    t.integer  "adj_type"
    t.float    "adj_val"
    t.boolean  "apply_recon"
    t.string   "type"
    t.integer  "payout_vendor_id"
  end

  create_table "pushed_creatives", force: true do |t|
    t.integer  "user_id"
    t.integer  "creative_id"
    t.integer  "site_id"
    t.integer  "network_publisher_id"
    t.integer  "status_code"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "q1_fixed", id: false, force: true do |t|
    t.date    "date"
    t.integer "ad_id",      limit: 8
    t.float   "imp"
    t.float   "clicks"
    t.float   "gross_rev"
    t.float   "pub_payout"
    t.float   "dp_payout"
    t.float   "rm_payout"
    t.float   "other_cost"
    t.float   "dart_cost"
  end

  create_table "rate_types", force: true do |t|
    t.string   "category"
    t.integer  "network_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "rate_types", ["network_id"], name: "index_rate_types_on_network_id", using: :btree

  create_table "raw_adjuster_load_2014_03_28_2014_03_28", id: false, force: true do |t|
    t.date   "report_date"
    t.string "third_party_name",        limit: nil
    t.string "ad_id",                   limit: nil
    t.string "creative_id",             limit: nil
    t.string "impressions",             limit: nil
    t.string "third_party_impressions", limit: nil
    t.string "clicks",                  limit: nil
    t.string "third_party_clicks",      limit: nil
  end

  create_table "raw_adjuster_load_2014_03_29_2014_03_29", id: false, force: true do |t|
    t.date   "report_date"
    t.string "third_party_name",        limit: nil
    t.string "ad_id",                   limit: nil
    t.string "creative_id",             limit: nil
    t.string "impressions",             limit: nil
    t.string "third_party_impressions", limit: nil
    t.string "clicks",                  limit: nil
    t.string "third_party_clicks",      limit: nil
  end

  create_table "raw_adjuster_load_2014_03_30_2014_03_30", id: false, force: true do |t|
    t.date   "report_date"
    t.string "third_party_name",        limit: nil
    t.string "ad_id",                   limit: nil
    t.string "creative_id",             limit: nil
    t.string "impressions",             limit: nil
    t.string "third_party_impressions", limit: nil
    t.string "clicks",                  limit: nil
    t.string "third_party_clicks",      limit: nil
  end

  create_table "reach_audience_groups", force: true do |t|
    t.string   "name"
    t.string   "key_values", limit: 32000
    t.integer  "network_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "reach_audience_groups", ["name", "network_id"], name: "index_reach_audience_groups_on_name_and_network_id", unique: true, using: :btree

  create_table "reach_block_logs", force: true do |t|
    t.string   "action",              null: false
    t.string   "status",              null: false
    t.string   "message"
    t.integer  "site_id",             null: false
    t.integer  "advertiser_id"
    t.integer  "advertiser_group_id"
    t.integer  "user_id",             null: false
    t.datetime "created_at",          null: false
    t.datetime "updated_at",          null: false
  end

  create_table "reach_block_violations", force: true do |t|
    t.integer  "site_id"
    t.integer  "advertiser_id"
    t.integer  "ad_id"
    t.string   "block_tool_state"
    t.string   "dfp_state"
    t.datetime "created_at"
  end

  create_table "reach_clients", force: true do |t|
    t.string   "name",                             null: false
    t.string   "abbr",                             null: false
    t.integer  "network_id",                       null: false
    t.integer  "user_id"
    t.integer  "sales_person_id"
    t.integer  "account_manager_id"
    t.datetime "created_at",                       null: false
    t.datetime "updated_at",                       null: false
    t.integer  "media_contact_id"
    t.integer  "billing_contact_id"
    t.integer  "agency_id"
    t.decimal  "client_buffer",      default: 0.0
  end

  add_index "reach_clients", ["account_manager_id"], name: "index_reach_clients_on_account_manager_id", using: :btree
  add_index "reach_clients", ["network_id"], name: "index_reach_clients_on_network_id", using: :btree
  add_index "reach_clients", ["sales_person_id"], name: "index_reach_clients_on_sales_person_id", using: :btree
  add_index "reach_clients", ["user_id"], name: "index_reach_clients_on_user_id", using: :btree

  create_table "reach_default_site_blocks", force: true do |t|
    t.integer  "site_id"
    t.integer  "user_id"
    t.integer  "network_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "reach_io_logs", force: true do |t|
    t.string   "message",       null: false
    t.string   "type",          null: false
    t.integer  "ad_id"
    t.integer  "creative_id"
    t.integer  "order_id",      null: false
    t.integer  "assignment_id"
    t.datetime "created_at",    null: false
  end

  add_index "reach_io_logs", ["ad_id"], name: "index_reach_io_logs_on_ad_id", using: :btree
  add_index "reach_io_logs", ["assignment_id"], name: "index_reach_io_logs_on_assignment_id", using: :btree
  add_index "reach_io_logs", ["creative_id"], name: "index_reach_io_logs_on_creative_id", using: :btree
  add_index "reach_io_logs", ["order_id"], name: "index_reach_io_logs_on_order_id", using: :btree

  create_table "reach_platforms", force: true do |t|
    t.string   "name",                             null: false
    t.integer  "media_type_id"
    t.string   "dfp_key"
    t.integer  "site_id"
    t.string   "naming_convention"
    t.string   "ad_type"
    t.integer  "priority"
    t.boolean  "enabled",           default: true
    t.integer  "network_id",                       null: false
    t.datetime "created_at",                       null: false
    t.datetime "updated_at",                       null: false
  end

  create_table "reach_report_columns", force: true do |t|
    t.string  "name"
    t.string  "internal_name"
    t.boolean "is_removable"
    t.integer "index"
    t.string  "format"
    t.integer "precision"
  end

  create_table "reach_report_dimensions", force: true do |t|
    t.string  "name"
    t.string  "internal_id"
    t.string  "default_column"
    t.integer "index"
  end

  create_table "reach_schedule_report_history", force: true do |t|
    t.integer  "job_id"
    t.datetime "start_date_time"
    t.datetime "end_date_time"
    t.string   "url",             limit: 1000
    t.integer  "report_id"
  end

  create_table "reach_schedule_reports", force: true do |t|
    t.integer  "user_id"
    t.string   "title"
    t.string   "email"
    t.boolean  "recalculate_dates"
    t.datetime "start_date",                                           null: false
    t.datetime "end_date",                                             null: false
    t.string   "url",               limit: 2000
    t.datetime "last_ran"
    t.string   "frequency_type"
    t.string   "frequency_value"
    t.datetime "report_start_date",                                    null: false
    t.datetime "report_end_date"
    t.string   "status",                         default: "Scheduled"
    t.datetime "created_at",                                           null: false
    t.datetime "updated_at",                                           null: false
  end

  create_table "reach_sites_block", force: true do |t|
    t.integer  "advertiser_id"
    t.integer  "advertiser_group_id"
    t.integer  "site_id"
    t.string   "state"
    t.string   "type"
    t.integer  "network_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "reach_sites_block", ["advertiser_group_id", "site_id"], name: "reach_sites_block_unique_adv_grp_id_site_id", unique: true, using: :btree
  add_index "reach_sites_block", ["advertiser_id", "site_id"], name: "reach_sites_block_unique_adv_id_site_id", unique: true, using: :btree

  create_table "reconciliations", force: true do |t|
    t.integer  "order_id"
    t.integer  "ad_id",                   limit: 8
    t.integer  "billing_period_id"
    t.integer  "third_party",             limit: 8
    t.integer  "network_advertiser_id"
    t.integer  "network_id"
    t.float    "recon_rate"
    t.string   "cost_type",               limit: 3
    t.integer  "delivered_imps",          limit: 8
    t.integer  "delivered_clicks"
    t.float    "delivered_revenue"
    t.float    "third_party_revenue"
    t.float    "discrepancy"
    t.boolean  "is_closed"
    t.float    "gross_rev"
    t.string   "ad_name"
    t.string   "order_name"
    t.string   "network_advertiser_name"
    t.float    "ad_rate"
    t.boolean  "is_internal_redirect",              default: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "reconciliations", ["billing_period_id", "ad_id"], name: "reconciliations_b_ad_idx", unique: true, using: :btree
  add_index "reconciliations", ["billing_period_id", "network_id"], name: "reconciliations_m_y_idx", using: :btree

  create_table "reconciliations_backup", id: false, force: true do |t|
    t.integer  "id"
    t.integer  "order_id"
    t.integer  "ad_id"
    t.integer  "billing_period_id"
    t.integer  "third_party",             limit: 8
    t.integer  "network_advertiser_id"
    t.integer  "network_id"
    t.float    "recon_rate"
    t.string   "cost_type",               limit: 3
    t.integer  "delivered_imps",          limit: 8
    t.integer  "delivered_clicks"
    t.float    "delivered_revenue"
    t.float    "third_party_revenue"
    t.float    "discrepancy"
    t.boolean  "is_closed"
    t.float    "gross_rev"
    t.string   "ad_name"
    t.string   "order_name"
    t.string   "network_advertiser_name"
    t.float    "ad_rate"
    t.boolean  "is_internal_redirect"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "reg_test", id: false, force: true do |t|
    t.integer "id"
    t.string  "name", limit: 50
  end

  create_table "regions", force: true do |t|
    t.integer  "network_id"
    t.string   "name",       null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "registered_keys", force: true do |t|
    t.integer  "network_id"
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "registered_keys", ["name"], name: "index_registered_keys_on_name", unique: true, using: :btree
  add_index "registered_keys", ["network_id"], name: "index_registered_keys_on_network_id", using: :btree

  create_table "removed_cm_default_zones_2013_08_20", id: false, force: true do |t|
    t.integer  "id"
    t.string   "keyname",                     limit: 200
    t.integer  "site_id"
    t.string   "site",                        limit: 64
    t.string   "context",                     limit: 40
    t.string   "source_id"
    t.integer  "section_id"
    t.boolean  "always_payout_flag"
    t.string   "z_site",                      limit: 50
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "active"
    t.integer  "zone_type_id"
    t.integer  "order_id"
    t.string   "site_placement"
    t.string   "content_category"
    t.string   "strategy"
    t.date     "start_date"
    t.date     "end_date"
    t.string   "group_type"
    t.string   "pricing_type"
    t.string   "cap_cost"
    t.integer  "purchase_qty",                limit: 8
    t.float    "purchase_cost"
    t.integer  "flight_activated"
    t.integer  "activity_category_id"
    t.string   "source_group_parent_id"
    t.string   "source_activity_category_id"
    t.integer  "parent_id"
    t.float    "cumulative_cost"
    t.integer  "network_id"
    t.integer  "data_source_id"
  end

  create_table "report_filters", force: true do |t|
    t.integer "component_id",    null: false
    t.string  "cdb_field",       null: false
    t.integer "filterable_id",   null: false
    t.string  "filterable_type", null: false
  end

  create_table "report_schedules", force: true do |t|
    t.integer  "user_id"
    t.string   "report_type",       limit: 16
    t.string   "title"
    t.string   "email"
    t.integer  "weekdays"
    t.decimal  "days"
    t.integer  "months"
    t.integer  "recalculate_dates"
    t.string   "date_calculation",  limit: 45
    t.string   "last_ran",          limit: 45
    t.string   "status",            limit: 45, default: "Scheduled"
    t.string   "parameters",        limit: 45
    t.text     "url"
    t.integer  "expand_all",                   default: 0
    t.string   "selected_view",     limit: 45
    t.integer  "run_duration",                 default: 7776000,     null: false
    t.datetime "run_from",                     default: "now()",     null: false
    t.integer  "parent_id"
  end

  create_table "report_schedules_090113", id: false, force: true do |t|
    t.integer  "id"
    t.integer  "user_id"
    t.string   "report_type",       limit: 16
    t.string   "title"
    t.string   "email"
    t.integer  "weekdays"
    t.decimal  "days"
    t.integer  "months"
    t.integer  "recalculate_dates"
    t.string   "date_calculation",  limit: 45
    t.string   "last_ran",          limit: 45
    t.string   "status",            limit: 45
    t.string   "parameters",        limit: 45
    t.text     "url"
    t.integer  "expand_all"
    t.string   "selected_view",     limit: 45
    t.integer  "run_duration"
    t.datetime "run_from"
    t.integer  "parent_id"
  end

  create_table "research_request_notes", force: true do |t|
    t.integer  "research_request_id",                 null: false
    t.string   "external_id",                         null: false
    t.string   "title"
    t.text     "body"
    t.boolean  "attachment",          default: false
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.string   "created_by"
  end

  create_table "research_requests", force: true do |t|
    t.integer  "network_id",                                    null: false
    t.integer  "opportunity_id",                                null: false
    t.integer  "amp_order_id"
    t.string   "external_id",                                   null: false
    t.string   "name",                                          null: false
    t.string   "demo",                          default: "n/a", null: false
    t.string   "approval_status"
    t.string   "geographic_scope",                              null: false
    t.text     "region_if_not_national"
    t.date     "start_date",                                    null: false
    t.date     "end_date",                                      null: false
    t.decimal  "total_spend",                                   null: false
    t.decimal  "total_impressions",                             null: false
    t.boolean  "audience_hd"
    t.boolean  "one_metric_survey_vizu"
    t.boolean  "igrp"
    t.boolean  "online_only_survey"
    t.boolean  "audience_verification"
    t.boolean  "mobile_one_metric_survey_vizu"
    t.boolean  "viewability"
    t.boolean  "mobile_only_survey"
    t.boolean  "offline_sales_lift"
    t.boolean  "reach_report"
    t.boolean  "search_research"
    t.boolean  "frequency_report"
    t.boolean  "tv_tune_in"
    t.boolean  "brand_lift_survey"
    t.string   "other_research"
    t.boolean  "tva_research_brand_lift"
    t.boolean  "tva_research_search_research"
    t.boolean  "display"
    t.boolean  "rich_media"
    t.decimal  "display_impressions"
    t.decimal  "rich_media_impressions"
    t.boolean  "video"
    t.boolean  "mobile"
    t.decimal  "video_impressions"
    t.decimal  "mobile_impressions"
    t.decimal  "banner_impressions"
    t.boolean  "other"
    t.boolean  "tablet"
    t.boolean  "guaranteed_in_view"
    t.boolean  "guaranteed_in_target"
    t.integer  "percent_in_view_goal"
    t.integer  "percent_in_target_goal"
    t.string   "grps_reach_of_tv_schedule"
    t.string   "reach_ratings_for_show"
    t.boolean  "tva_high"
    t.boolean  "tva_low"
    t.boolean  "tva_competitive"
    t.boolean  "tva_channels"
    t.boolean  "tva_custom"
    t.string   "tva_custom_specify"
    t.string   "behavioral_demo_target_1"
    t.string   "behavioral_demo_target_2"
    t.string   "behavioral_demo_target_3"
    t.boolean  "no_tva_targeting"
    t.string   "campaign_goal_1"
    t.string   "campaign_goal_2"
    t.string   "campaign_goal_3"
    t.string   "campaign_goal_4"
    t.boolean  "brand_lift_1"
    t.boolean  "incremental_frequency_1"
    t.boolean  "incremental_reach_1"
    t.boolean  "ad_viewability_1"
    t.boolean  "audience_verification_1"
    t.boolean  "offline_sales_impact_1"
    t.boolean  "online_search_impact_1"
    t.boolean  "ctr_cpa_cpx_cpe_vtc_1"
    t.boolean  "tune_in_impact_1"
    t.string   "other_metric_1"
    t.boolean  "brand_lift_2"
    t.boolean  "incremental_frequency_2"
    t.boolean  "incremental_reach_2"
    t.boolean  "ad_viewability_2"
    t.boolean  "audience_verification_2"
    t.boolean  "offline_sales_impact_2"
    t.boolean  "online_search_impact_2"
    t.boolean  "ctr_cpa_cpx_cpe_vtc_2"
    t.boolean  "tune_in_impact_2"
    t.string   "other_metric_2"
    t.datetime "deleted_on"
    t.datetime "created_at",                                    null: false
    t.datetime "updated_at",                                    null: false
    t.string   "created_by"
    t.string   "last_modified_by"
    t.decimal  "tablet_impressions"
    t.decimal  "other_impressions"
  end

  create_table "revenue_schedules", force: true do |t|
    t.integer  "opportunity_line_item_id",               null: false
    t.decimal  "amount",                   default: 0.0
    t.datetime "created_at",                             null: false
    t.datetime "updated_at",                             null: false
    t.date     "date",                                   null: false
    t.datetime "deleted_on"
    t.integer  "opportunity_id",                         null: false
    t.integer  "network_id",                             null: false
    t.string   "external_id",                            null: false
    t.decimal  "expected_revenue",         default: 0.0
    t.decimal  "impressions"
  end

  add_index "revenue_schedules", ["network_id", "date"], name: "index_revenue_schedules_on_network_id_and_date", using: :btree
  add_index "revenue_schedules", ["network_id", "opportunity_line_item_id", "external_id"], name: "index_rev_sched_on_net_id_and_opp_line_item_id_and_ext_id", using: :btree

  create_table "rich_media_payouts", force: true do |t|
    t.integer  "network_id"
    t.integer  "billing_period_id"
    t.integer  "ad_id",                limit: 8
    t.date     "date"
    t.float    "payout"
    t.integer  "publisher_revenue_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "imps"
    t.float    "clicks"
  end

  add_index "rich_media_payouts", ["billing_period_id"], name: "index_rich_media_payouts_on_billing_period_id", using: :btree

  create_table "rich_media_payouts_sum", id: false, force: true do |t|
    t.integer  "network_id"
    t.integer  "billing_period_id"
    t.integer  "ad_id",                limit: 8
    t.date     "date"
    t.float    "payout"
    t.integer  "publisher_revenue_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "imps"
    t.float    "clicks"
  end

  create_table "roles", force: true do |t|
    t.string   "name"
    t.string   "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "roles_users", id: false, force: true do |t|
    t.integer "user_id", null: false
    t.integer "role_id", null: false
  end

  add_index "roles_users", ["role_id"], name: "index_roles_users_on_role_id", using: :btree
  add_index "roles_users", ["user_id"], name: "index_roles_users_on_user_id", using: :btree

  create_table "roles_users_backup", id: false, force: true do |t|
    t.integer "user_id"
    t.integer "role_id"
  end

  create_table "roles_users_bk2", id: false, force: true do |t|
    t.integer "user_id"
    t.integer "role_id"
  end

  create_table "rollup_assignments", force: true do |t|
    t.integer  "network_id"
    t.integer  "modified_by"
    t.integer  "segment_id",  null: false
    t.integer  "rollup_id",   null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "rollup_assignments", ["modified_by"], name: "index_rollup_assignments_on_modified_by", using: :btree
  add_index "rollup_assignments", ["network_id"], name: "index_rollup_assignments_on_network_id", using: :btree
  add_index "rollup_assignments", ["rollup_id"], name: "index_rollup_assignments_on_rollup_id", using: :btree
  add_index "rollup_assignments", ["segment_id"], name: "index_rollup_assignments_on_segment_id", using: :btree

  create_table "rollups", force: true do |t|
    t.integer  "ancestry_depth",             default: 0, null: false
    t.integer  "network_id"
    t.integer  "modified_by"
    t.string   "name"
    t.string   "ancestry"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "path",           limit: nil,                          array: true
  end

  add_index "rollups", ["ancestry"], name: "index_rollups_on_ancestry", using: :btree
  add_index "rollups", ["ancestry_depth"], name: "index_rollups_on_ancestry_depth", using: :btree
  add_index "rollups", ["modified_by"], name: "index_rollups_on_modified_by", using: :btree
  add_index "rollups", ["name"], name: "index_rollups_on_name", using: :btree
  add_index "rollups", ["network_id"], name: "index_rollups_on_network_id", using: :btree
  add_index "rollups", ["path"], name: "index_rollups_on_path", using: :btree

  create_table "rtb_ad", force: true do |t|
    t.string   "source_id",                            null: false
    t.string   "ad_name"
    t.string   "ad_type",                  limit: 50
    t.boolean  "approved"
    t.boolean  "ready_to_serve"
    t.datetime "ad_start_date"
    t.datetime "ad_end_date"
    t.string   "ad_cost_type",             limit: 5
    t.decimal  "ad_rate"
    t.integer  "ad_quantity"
    t.integer  "ad_delivered_impressions"
    t.integer  "ad_delivered_clicks"
    t.boolean  "hard_cut_off"
    t.boolean  "allow_over_delivery"
    t.integer  "delivery_scheduling",      limit: 2
    t.integer  "dart_network_id"
    t.integer  "dart_sub_network_id"
    t.integer  "dart_advertiser_id"
    t.integer  "dart_order_id"
    t.string   "key_value_expr",           limit: nil
    t.integer  "frequency"
    t.integer  "frequency_seconds"
    t.string   "postal_codes",             limit: nil
    t.string   "size",                     limit: 12
    t.integer  "priority"
  end

  add_index "rtb_ad", ["source_id"], name: "rtb_ad_source_id_index", using: :btree

  create_table "rtb_creatives", force: true do |t|
    t.string  "source_id"
    t.integer "ad_id"
    t.string  "click_thru_url", limit: nil
  end

  create_table "sa_adv_ids", id: false, force: true do |t|
    t.integer "id"
  end

  create_table "sa_advs", id: false, force: true do |t|
    t.string "name", limit: 100
  end

  create_table "sa_pub_ids", id: false, force: true do |t|
    t.integer "id"
  end

  create_table "sa_sites", id: false, force: true do |t|
    t.string "name", limit: 100
  end

  create_table "sales_channels", force: true do |t|
    t.string   "name",       null: false
    t.integer  "network_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "sales_channels", ["network_id", "name"], name: "index_sales_channels_on_network_id_and_name", unique: true, using: :btree
  add_index "sales_channels", ["network_id"], name: "index_sales_channels_on_network_id", using: :btree

  create_table "sales_offices", force: true do |t|
    t.integer  "network_id"
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "region_id"
  end

  create_table "sales_people", force: true do |t|
    t.string   "name",            limit: 64
    t.string   "office",          limit: 45
    t.integer  "network_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "sales_office_id"
  end

  create_table "schedule_history", force: true do |t|
    t.integer  "job_id"
    t.datetime "start_date_time"
    t.datetime "end_date_time"
    t.string   "url"
    t.integer  "report_id"
  end

  create_table "screen_categories", force: true do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "screen_types", force: true do |t|
    t.string   "category"
    t.integer  "network_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "screen_types", ["network_id"], name: "index_screen_types_on_network_id", using: :btree

  create_table "sections", force: true do |t|
    t.string "name", limit: 64, null: false
  end

  create_table "segment_34249_payouts", id: false, force: true do |t|
    t.integer "ad_id"
    t.float   "payout"
  end

  create_table "segment_group_assignments", force: true do |t|
    t.integer  "network_id"
    t.integer  "modified_by"
    t.integer  "segment_id",       null: false
    t.integer  "segment_group_id", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "segment_group_assignments", ["modified_by"], name: "index_segment_group_assignments_on_modified_by", using: :btree
  add_index "segment_group_assignments", ["network_id"], name: "index_segment_group_assignments_on_network_id", using: :btree
  add_index "segment_group_assignments", ["segment_group_id"], name: "index_segment_group_assignments_on_segment_group_id", using: :btree
  add_index "segment_group_assignments", ["segment_id", "network_id", "segment_group_id"], name: "index_segment_group_assignments_unique", unique: true, using: :btree
  add_index "segment_group_assignments", ["segment_id"], name: "index_segment_group_assignments_on_segment_id", using: :btree

  create_table "segment_groups", force: true do |t|
    t.string   "name"
    t.string   "friendly_name"
    t.integer  "network_id"
    t.integer  "modified_by"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "segment_groups", ["friendly_name", "network_id"], name: "index_segment_groups_on_friendly_name_and_network_id", unique: true, using: :btree
  add_index "segment_groups", ["modified_by"], name: "index_segment_groups_on_modified_by", using: :btree
  add_index "segment_groups", ["name", "network_id"], name: "index_segment_groups_on_name_and_network_id", unique: true, using: :btree
  add_index "segment_groups", ["name"], name: "index_segment_groups_on_name", using: :btree
  add_index "segment_groups", ["network_id"], name: "index_segment_groups_on_network_id", using: :btree

  create_table "segment_pools", force: true do |t|
    t.integer  "segment_id", null: false
    t.integer  "pool_size",  null: false
    t.datetime "date",       null: false
  end

  add_index "segment_pools", ["segment_id", "date"], name: "index_segment_pools_on_segment_id_and_date", unique: true, using: :btree
  add_index "segment_pools", ["segment_id"], name: "index_segment_pools_on_segment_id", using: :btree

  create_table "segment_stable_uniques", id: false, force: true do |t|
    t.string  "name"
    t.integer "uniques_count"
    t.float   "proportion"
  end

  create_table "segments", force: true do |t|
    t.string   "name"
    t.string   "friendly_name"
    t.string   "translated_name"
    t.string   "type"
    t.integer  "network_id"
    t.integer  "modified_by"
    t.integer  "parent_id"
    t.integer  "time"
    t.integer  "frequency"
    t.integer  "telluride_id"
    t.integer  "cdb_id"
    t.text     "description"
    t.boolean  "inactive",        default: false, null: false
    t.boolean  "targeting",       default: true,  null: false
    t.boolean  "reporting",       default: true,  null: false
    t.boolean  "forecasting",     default: true,  null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "locked",          default: false, null: false
    t.datetime "activated_at"
    t.boolean  "optional",        default: false, null: false
    t.integer  "latest_pool",     default: 0
  end

  add_index "segments", ["cdb_id"], name: "index_segments_on_cdb_id", using: :btree
  add_index "segments", ["forecasting"], name: "index_segments_on_forecasting", using: :btree
  add_index "segments", ["inactive"], name: "index_segments_on_inactive", using: :btree
  add_index "segments", ["modified_by"], name: "index_segments_on_modified_by", using: :btree
  add_index "segments", ["name"], name: "index_segments_on_name", unique: true, using: :btree
  add_index "segments", ["network_id"], name: "index_segments_on_network_id", using: :btree
  add_index "segments", ["reporting"], name: "index_segments_on_reporting", using: :btree
  add_index "segments", ["targeting"], name: "index_segments_on_targeting", using: :btree
  add_index "segments", ["telluride_id"], name: "index_segments_on_telluride_id", using: :btree
  add_index "segments", ["translated_name"], name: "index_segments_on_translated_name", using: :btree
  add_index "segments", ["type"], name: "index_segments_on_type", using: :btree

  create_table "site_block_maps", force: true do |t|
    t.integer  "site_block_id", null: false
    t.integer  "site_id",       null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "site_blocks", force: true do |t|
    t.string   "name",       null: false
    t.integer  "network_id", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "site_min_cpm_job_logs", force: true do |t|
    t.integer  "job_id"
    t.integer  "site_id"
    t.integer  "ad_id"
    t.string   "error_message"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "site_min_cpms", force: true do |t|
    t.integer  "site_id"
    t.float    "min_cpm"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "company_id"
    t.integer  "user_id"
  end

  create_table "site_region_targets", force: true do |t|
    t.integer  "network_id"
    t.string   "name",       null: false
    t.string   "source_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "site_region_targets", ["source_id"], name: "index_site_region_targets_on_source_id", using: :btree

  create_table "site_region_targets_sites", force: true do |t|
    t.integer  "site_region_target_id", null: false
    t.integer  "site_id",               null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "site_targeting", id: false, force: true do |t|
    t.integer "ad_id",   null: false
    t.integer "site_id", null: false
  end

  add_index "site_targeting", ["ad_id", "site_id"], name: "index_site_targeting_on_ad_id_and_site_id", using: :btree

  create_table "site_types", force: true do |t|
    t.string   "category",   limit: 50
    t.integer  "network_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "site_types", ["network_id", "category"], name: "index_site_types_on_network_id_and_category", unique: true, using: :btree

  create_table "sites", force: true do |t|
    t.integer  "network_publisher_id"
    t.string   "name",                                  null: false
    t.integer  "source_ad_server_id",    default: 1,    null: false
    t.string   "source_id",                             null: false
    t.string   "source_advertiser_id"
    t.integer  "amp2_site_id"
    t.integer  "amp2_publisher_id"
    t.integer  "amp2_master_id"
    t.string   "keyname"
    t.integer  "subnetwork_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "active",                 default: true, null: false
    t.integer  "site_type_id"
    t.integer  "network_id",                            null: false
    t.boolean  "is_explicitly_targeted"
    t.integer  "data_source_id",         default: 1,    null: false
    t.integer  "domain_id"
  end

  add_index "sites", ["data_source_id", "source_id", "network_id"], name: "index_sites_on_trinity", unique: true, using: :btree
  add_index "sites", ["network_publisher_id"], name: "index_sites_on_network_publisher_id", using: :btree

  create_table "slot_size", id: false, force: true do |t|
    t.string  "size",      limit: 10
    t.integer "width"
    t.integer "height"
    t.integer "source_id"
    t.integer "popular"
  end

  create_table "slot_sizes", force: true do |t|
    t.string  "size",      limit: 10, null: false
    t.integer "width"
    t.integer "height"
    t.integer "source_id"
  end

  create_table "slot_sizes_by_network", id: false, force: true do |t|
    t.integer "network_id"
    t.integer "id"
    t.string  "size",       limit: 10
    t.integer "width"
    t.integer "height"
    t.integer "source_id"
    t.boolean "popular",               default: false
  end

  create_table "slot_sizes_temp", id: false, force: true do |t|
    t.integer "network_id"
    t.string  "size",       limit: 10
    t.integer "width"
    t.integer "height"
    t.integer "source_id"
    t.boolean "popular",               default: false
  end

  create_table "state_targeting", id: false, force: true do |t|
    t.integer "ad_id"
    t.integer "state_id"
  end

  add_index "state_targeting", ["ad_id", "state_id"], name: "index_state_targeting_on_ad_id_and_state_id", using: :btree

  create_table "states", force: true do |t|
    t.string  "abbr",       limit: 6,  null: false
    t.string  "name",       limit: 50, null: false
    t.integer "country_id"
    t.integer "source_id",             null: false
    t.integer "xfp_id"
  end

  add_index "states", ["country_id", "abbr"], name: "states_country_id_key", unique: true, using: :btree

  create_table "states_lineitems", id: false, force: true do |t|
    t.integer "state_id"
    t.integer "lineitem_id"
  end

  add_index "states_lineitems", ["lineitem_id"], name: "index_states_lineitems_on_lineitem_id", using: :btree

  create_table "status_codes", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "subnetworks", force: true do |t|
    t.string   "name"
    t.integer  "network_id"
    t.string   "source_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "data_source_id", default: 1, null: false
  end

  add_index "subnetworks", ["data_source_id", "source_id", "network_id"], name: "index_subnetworks_on_trinity", unique: true, using: :btree

  create_table "sync_channels", force: true do |t|
    t.string  "name"
    t.integer "job_id"
    t.integer "amp_id"
    t.integer "dart_id"
    t.integer "user_action", default: 0
    t.boolean "resolved"
  end

  create_table "sync_channels_sites", force: true do |t|
    t.integer "job_id"
    t.integer "channel_id"
    t.integer "site_id"
    t.string  "name"
    t.boolean "conflict"
  end

  add_index "sync_channels_sites", ["channel_id"], name: "index_sync_channels_sites_on_channel_id", using: :btree
  add_index "sync_channels_sites", ["job_id"], name: "index_sync_channels_sites_on_job_id", using: :btree

  create_table "sync_channels_zones", force: true do |t|
    t.integer "job_id"
    t.integer "channel_id"
    t.integer "zone_id"
    t.string  "name"
    t.integer "site_id"
    t.boolean "resolved"
  end

  add_index "sync_channels_zones", ["channel_id"], name: "index_sync_channels_zones_on_channel_id", using: :btree
  add_index "sync_channels_zones", ["job_id"], name: "index_sync_channels_zones_on_job_id", using: :btree

  create_table "sync_content_categories_sites", force: true do |t|
    t.integer "job_id"
    t.integer "content_category_id"
    t.integer "site_id"
    t.string  "name"
    t.boolean "conflict"
  end

  add_index "sync_content_categories_sites", ["content_category_id"], name: "index_sync_content_categories_sites_on_content_category_id", using: :btree
  add_index "sync_content_categories_sites", ["job_id"], name: "index_sync_content_categories_sites_on_job_id", using: :btree

  create_table "sync_content_categories_zones", force: true do |t|
    t.integer "job_id"
    t.integer "content_category_id"
    t.integer "zone_id"
    t.string  "name"
    t.integer "site_id"
  end

  add_index "sync_content_categories_zones", ["content_category_id"], name: "index_sync_content_categories_zones_on_content_category_id", using: :btree
  add_index "sync_content_categories_zones", ["job_id"], name: "index_sync_content_categories_zones_on_job_id", using: :btree

  create_table "t_arm", id: false, force: true do |t|
    t.integer "ad_group_id"
  end

  create_table "t_arm2", id: false, force: true do |t|
    t.integer "ad_group_id", limit: 8
  end

  create_table "tag_groups", force: true do |t|
    t.string  "friendly_name"
    t.string  "name"
    t.integer "network_id"
    t.string  "gtype",         limit: 3, default: "seg"
  end

  create_table "tag_groups_tags", id: false, force: true do |t|
    t.integer "tag_group_id", null: false
    t.integer "tag_id",       null: false
  end

  create_table "tag_rollups", force: true do |t|
    t.integer "tag_id"
    t.integer "network_id"
    t.integer "level"
    t.string  "name"
  end

  create_table "tags", force: true do |t|
    t.string  "name"
    t.string  "friendly_name"
    t.boolean "ctx",           default: false
    t.boolean "pix",           default: false
    t.boolean "seg",           default: false
    t.integer "network_id"
    t.integer "frequency"
    t.integer "time"
    t.integer "seg_tag_id"
  end

  add_index "tags", ["name"], name: "tags_name_key", unique: true, using: :btree

  create_table "targeted_key_values", force: true do |t|
    t.string  "keyword",    limit: 256
    t.integer "network_id"
  end

  add_index "targeted_key_values", ["keyword", "network_id"], name: "targeted_key_values_keyword_key", unique: true, using: :btree

  create_table "targeted_key_values_full", force: true do |t|
    t.string   "keyword",    null: false
    t.integer  "ad_id",      null: false
    t.integer  "network_id", null: false
    t.integer  "ordinal"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "task_activity_logs", force: true do |t|
    t.text     "note"
    t.integer  "created_by",       null: false
    t.integer  "updated_by",       null: false
    t.integer  "task_id",          null: false
    t.integer  "activity_type_id", null: false
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
  end

  create_table "task_attachments", force: true do |t|
    t.string   "file_name",  null: false
    t.string   "file_path"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "task_states", force: true do |t|
    t.string "state", null: false
  end

  create_table "task_types", force: true do |t|
    t.string  "type",                null: false
    t.integer "default_sla",         null: false
    t.integer "default_assignee_id", null: false
  end

  create_table "tasks", force: true do |t|
    t.string   "name",            null: false
    t.datetime "due_date"
    t.datetime "completion_date"
    t.integer  "created_by",      null: false
    t.integer  "updated_by",      null: false
    t.integer  "task_type_id"
    t.integer  "requestor_id"
    t.integer  "order_id"
    t.integer  "task_state_id"
    t.integer  "assignable_id"
    t.string   "assignable_type"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  create_table "teams", force: true do |t|
    t.string "name", limit: 50, null: false
  end

  create_table "teams_users", force: true do |t|
    t.integer "team_id", null: false
    t.integer "user_id", null: false
  end

  create_table "temp123", id: false, force: true do |t|
    t.datetime "timestamp_1"
    t.datetime "timestamp_2"
  end

  create_table "temp_frequency_caps", id: false, force: true do |t|
    t.integer "ad_id"
    t.integer "cap_value"
    t.integer "time_value"
    t.integer "time_unit"
  end

  create_table "temp_metadata", id: false, force: true do |t|
    t.integer "id"
    t.text    "description"
    t.integer "order_id"
    t.string  "ad_type",      limit: 32
    t.string  "size",         limit: 12
    t.string  "tgt_type",     limit: 50
    t.string  "geo_type",     limit: 100
    t.string  "mkt_type",     limit: 50
    t.string  "sales_region"
  end

  create_table "temp_orders_1113", id: false, force: true do |t|
    t.string  "name"
    t.integer "imp"
    t.integer "clicks"
  end

  create_table "temp_payout_site_list", id: false, force: true do |t|
    t.string "name"
    t.float  "revenue_rate"
  end

  create_table "template_payouts", id: false, force: true do |t|
    t.date    "date"
    t.integer "ad_id",       limit: 8
    t.integer "segment_id"
    t.float   "impressions"
    t.float   "clicks"
    t.float   "dp_payout"
    t.float   "rm_payout"
  end

  create_table "test1", id: false, force: true do |t|
    t.integer  "id"
    t.integer  "id2"
    t.datetime "updated_at"
  end

  create_table "test_load", id: false, force: true do |t|
    t.integer "id"
    t.date    "date"
  end

  create_table "test_pubs", id: false, force: true do |t|
    t.integer "id"
    t.string  "name",       limit: nil
    t.string  "source_id",  limit: nil
    t.integer "new_pub_id"
  end

  create_table "tgt_types", force: true do |t|
    t.string   "category",   limit: 50
    t.integer  "network_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "tgt_types", ["network_id", "category"], name: "index_tgt_types_on_network_id_and_category", unique: true, using: :btree

  create_table "third_party_server_assignments", force: true do |t|
    t.string  "category",              null: false
    t.integer "amp_order_id",          null: false
    t.integer "third_party_server_id", null: false
  end

  add_index "third_party_server_assignments", ["amp_order_id", "category"], name: "third_party_server_assignemtns_unique_idx", unique: true, using: :btree
  add_index "third_party_server_assignments", ["amp_order_id"], name: "index_third_party_server_assignments_on_amp_order_id", using: :btree
  add_index "third_party_server_assignments", ["category"], name: "index_third_party_server_assignments_on_category", using: :btree
  add_index "third_party_server_assignments", ["third_party_server_id"], name: "index_third_party_server_assignments_on_third_party_server_id", using: :btree

  create_table "third_party_servers", force: true do |t|
    t.integer  "adjuster_id"
    t.string   "server_type"
    t.string   "uid",                         null: false
    t.string   "pwd",                         null: false
    t.text     "parameters"
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.string   "status"
    t.string   "name",             limit: 32
    t.integer  "arm_ad_server_id"
  end

  add_index "third_party_servers", ["adjuster_id"], name: "index_third_party_servers_on_adjuster_id", unique: true, using: :btree
  add_index "third_party_servers", ["server_type", "uid"], name: "index_third_party_servers_on_server_type_and_uid", unique: true, using: :btree
  add_index "third_party_servers", ["server_type"], name: "index_third_party_servers_on_server_type", using: :btree
  add_index "third_party_servers", ["uid"], name: "index_third_party_servers_on_uid", using: :btree

  create_table "tmplt_adjuster_data", id: false, force: true do |t|
    t.date   "report_date",                           null: false
    t.string "third_party_name",          limit: 128
    t.string "advertiser_id",                         null: false
    t.string "order_id"
    t.string "ad_id",                                 null: false
    t.string "creative_id",                           null: false
    t.string "creative_name",             limit: 512
    t.string "third_party_creative_id",   limit: 512
    t.string "third_party_creative_name", limit: 512
    t.string "impressions",               limit: 32
    t.string "third_party_impressions",   limit: 32
    t.string "contracted_impressions",    limit: 32
    t.string "scheduled_impressions",     limit: 32
    t.string "clicks",                    limit: 32
    t.string "third_party_clicks",        limit: 32
    t.string "contracted_clicks",         limit: 32
    t.string "scheduled_clicks",          limit: 32
  end

  create_table "tmplt_amp_data", id: false, force: true do |t|
    t.date    "report_date",                null: false
    t.integer "amp_ad_id",       limit: 8,  null: false
    t.integer "amp_creative_id", limit: 8,  null: false
    t.string  "impressions",     limit: 32
    t.string  "clicks",          limit: 32
  end

  create_table "uniques_old", id: false, force: true do |t|
    t.string  "name"
    t.integer "uniques_count"
    t.float   "proportion"
  end

  create_table "updated_cm_default_zones_2013_08_20", id: false, force: true do |t|
    t.integer  "id"
    t.string   "keyname",                     limit: 200
    t.integer  "site_id"
    t.string   "site",                        limit: 64
    t.string   "context",                     limit: 40
    t.string   "source_id"
    t.integer  "section_id"
    t.boolean  "always_payout_flag"
    t.string   "z_site",                      limit: 50
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "active"
    t.integer  "zone_type_id"
    t.integer  "order_id"
    t.string   "site_placement"
    t.string   "content_category"
    t.string   "strategy"
    t.date     "start_date"
    t.date     "end_date"
    t.string   "group_type"
    t.string   "pricing_type"
    t.string   "cap_cost"
    t.integer  "purchase_qty",                limit: 8
    t.float    "purchase_cost"
    t.integer  "flight_activated"
    t.integer  "activity_category_id"
    t.string   "source_group_parent_id"
    t.string   "source_activity_category_id"
    t.integer  "parent_id"
    t.float    "cumulative_cost"
    t.integer  "network_id"
    t.integer  "data_source_id"
  end

  create_table "usages", force: true do |t|
    t.integer "user_id",                  null: false
    t.integer "component_id",             null: false
    t.integer "x",            default: 0
    t.integer "y",            default: 0
  end

  add_index "usages", ["component_id"], name: "index_usages_on_component_id", using: :btree
  add_index "usages", ["user_id"], name: "index_usages_on_user_id", using: :btree

  create_table "users", force: true do |t|
    t.string   "account_login",         limit: 100,                                                      null: false
    t.string   "email"
    t.string   "phone_number"
    t.integer  "company_id",                                                                             null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "authority",                         default: "Normal",                                   null: false
    t.string   "first_name",            limit: 40,  default: "first",                                    null: false
    t.string   "last_name",             limit: 40,  default: "last",                                     null: false
    t.string   "activation_code",       limit: 16
    t.string   "client_type",           limit: 50,                                                       null: false
    t.integer  "network_publisher_id"
    t.integer  "network_advertiser_id"
    t.string   "aa_url",                            default: "http://qaa.collective-media.net/audience", null: false
    t.datetime "last_login_at"
    t.integer  "agency_id"
    t.integer  "data_provider_id"
    t.string   "status",                            default: "active"
  end

  add_index "users", ["account_login"], name: "index_users_on_account_login", unique: true, using: :btree

  create_table "versions", force: true do |t|
    t.string   "item_type",      null: false
    t.integer  "item_id",        null: false
    t.string   "event",          null: false
    t.string   "whodunnit"
    t.text     "object"
    t.datetime "created_at"
    t.text     "object_changes"
  end

  add_index "versions", ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id", using: :btree

  create_table "video_assignments", force: true do |t|
    t.integer  "ad_id",                         null: false
    t.integer  "video_creative_id",             null: false
    t.datetime "start_date"
    t.datetime "end_date"
    t.integer  "network_id",                    null: false
    t.integer  "data_source_id",    default: 1, null: false
  end

  add_index "video_assignments", ["ad_id", "video_creative_id"], name: "index_video_assignments_on_ad_id_and_video_creative_id", unique: true, using: :btree
  add_index "video_assignments", ["ad_id"], name: "index_video_assignments_on_ad_id", using: :btree
  add_index "video_assignments", ["video_creative_id"], name: "index_video_assignments_on_video_creative_id", using: :btree

  create_table "video_creatives", force: true do |t|
    t.string   "name",                              null: false
    t.integer  "network_advertiser_id",             null: false
    t.string   "size",                              null: false
    t.string   "source_id",                         null: false
    t.integer  "width"
    t.integer  "height"
    t.string   "source_ui_creative_id"
    t.integer  "network_id"
    t.integer  "data_source_id",        default: 1, null: false
    t.text     "redirect_url"
    t.text     "html_code"
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
  end

  add_index "video_creatives", ["data_source_id", "source_id", "network_id"], name: "index_video_creatives_on_trinity", unique: true, using: :btree
  add_index "video_creatives", ["network_advertiser_id"], name: "fki_video_creatives_network_advertiser_id", using: :btree

  create_table "video_dp_payouts", id: false, force: true do |t|
    t.string  "adv_name",   limit: nil
    t.integer "adv_id"
    t.string  "order_name", limit: nil
    t.integer "order_id"
    t.string  "ad_name",    limit: nil
    t.integer "ad_id"
    t.date    "start_date"
    t.float   "rate"
    t.string  "dp_name",    limit: nil
    t.integer "dp_id"
  end

  create_table "video_dp_payouts_2", id: false, force: true do |t|
    t.string  "adv_name",   limit: nil
    t.integer "adv_id"
    t.string  "order_name", limit: nil
    t.integer "order_id"
    t.string  "ad_name",    limit: nil
    t.integer "ad_id"
    t.date    "start_date"
    t.float   "rate"
    t.string  "dp_name",    limit: nil
    t.integer "dp_id"
  end

  create_table "video_dp_payouts_3", id: false, force: true do |t|
    t.string  "adv_name",   limit: nil
    t.integer "adv_id"
    t.string  "order_name", limit: nil
    t.integer "order_id"
    t.string  "ad_name",    limit: nil
    t.integer "ad_id"
    t.date    "start_date"
    t.float   "rate"
    t.string  "dp_name",    limit: nil
    t.integer "dp_id"
  end

  create_table "video_dp_payouts_eps", id: false, force: true do |t|
    t.string  "adv_name",   limit: nil
    t.integer "adv_id"
    t.string  "order_name", limit: nil
    t.integer "order_id"
    t.string  "ad_name",    limit: nil
    t.integer "ad_id"
    t.date    "start_date"
    t.float   "rate"
    t.string  "dp_name",    limit: nil
    t.integer "dp_id"
  end

  create_table "vrm_test", id: false, force: true do |t|
    t.integer  "id"
    t.integer  "network_publisher_id"
    t.string   "creative_size",          limit: 128
    t.integer  "zone_id"
    t.float    "revenue_rate"
    t.string   "revenue_type",           limit: 8
    t.string   "slot_size",              limit: 12
    t.integer  "channel_context_id"
    t.integer  "network_advertiser_id"
    t.date     "start_date"
    t.date     "end_date"
    t.string   "z_site",                 limit: 50
    t.boolean  "full_regen_required"
    t.boolean  "numbers_regen_required"
    t.integer  "amp2_publisher_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "order_id"
    t.integer  "ad_id"
    t.integer  "segment_id"
    t.float    "min_cpm_rate"
    t.boolean  "after_var_cost"
    t.integer  "payout_type_id"
    t.integer  "network_id"
    t.integer  "data_provider_id"
    t.integer  "rich_media_type_id"
    t.integer  "parent_id"
    t.boolean  "is_parent_payout"
    t.boolean  "adj_report_only"
    t.integer  "adj"
    t.integer  "adj_type"
    t.float    "adj_val"
    t.boolean  "apply_recon"
  end

  create_table "xfp_app_users", force: true do |t|
    t.string  "username"
    t.string  "password"
    t.integer "network_id"
    t.string  "net_prefix"
    t.integer "application_id", default: 0
  end

  add_index "xfp_app_users", ["username", "network_id", "application_id"], name: "unique_xfp_app_users", unique: true, using: :btree

  create_table "xfp_conversions", id: false, force: true do |t|
    t.integer  "network_id",                 null: false
    t.string   "table_name",                 null: false
    t.integer  "old_source_id", limit: 8
    t.integer  "new_source_id", limit: 8
    t.integer  "amp_id",        limit: 8
    t.string   "name",          limit: 4096
    t.datetime "created_at"
  end

  create_table "xfp_conversions_2012_10_15", id: false, force: true do |t|
    t.integer  "network_id"
    t.string   "table_name"
    t.integer  "old_source_id", limit: 8
    t.integer  "new_source_id", limit: 8
    t.integer  "amp_id",        limit: 8
    t.string   "name",          limit: 4096
    t.datetime "created_at"
  end

  create_table "xfp_conversions_syn_orig", id: false, force: true do |t|
    t.integer  "network_id"
    t.string   "table_name"
    t.integer  "old_source_id", limit: 8
    t.integer  "new_source_id", limit: 8
    t.integer  "amp_id",        limit: 8
    t.string   "name",          limit: 4096
    t.datetime "created_at"
  end

  create_table "xfp_to_dfp_video_mapping", force: true do |t|
    t.string  "xfp_action_name",       limit: 128, null: false
    t.integer "dfp_met_event_type_id",             null: false
    t.string  "metric_name",           limit: 256
  end

  add_index "xfp_to_dfp_video_mapping", ["xfp_action_name"], name: "xfp_to_dfp_video_mapping_xfp_action_name_key", unique: true, using: :btree

  create_table "zipcode_targeting", id: false, force: true do |t|
    t.integer "ad_id",      null: false
    t.integer "zipcode_id", null: false
  end

  add_index "zipcode_targeting", ["ad_id", "zipcode_id"], name: "index_zipcode_targeting_on_ad_id_and_zipcode_id", using: :btree

  create_table "zipcodes", force: true do |t|
    t.string "zipcode",   limit: 5
    t.float  "latitude"
    t.float  "longitude"
    t.string "state",     limit: 2
    t.string "city",      limit: 27
    t.string "county",    limit: 22
  end

  add_index "zipcodes", ["zipcode"], name: "index_zipcodes_on_zipcode", using: :btree

  create_table "zone_types", force: true do |t|
    t.integer  "network_id", null: false
    t.string   "category",   null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "zone_types", ["network_id", "category"], name: "index_zone_types_on_network_id_and_category", unique: true, using: :btree

  create_table "zones", force: true do |t|
    t.string   "keyname",                     limit: 200,                 null: false
    t.integer  "site_id",                                                 null: false
    t.string   "site",                        limit: 64
    t.string   "context",                     limit: 40
    t.string   "source_id",                                               null: false
    t.integer  "section_id"
    t.boolean  "always_payout_flag",                      default: false, null: false
    t.string   "z_site",                      limit: 50
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "active",                                  default: true,  null: false
    t.integer  "zone_type_id"
    t.integer  "order_id"
    t.string   "site_placement"
    t.string   "content_category"
    t.string   "strategy"
    t.date     "start_date"
    t.date     "end_date"
    t.string   "group_type"
    t.string   "pricing_type"
    t.string   "cap_cost"
    t.integer  "purchase_qty",                limit: 8
    t.float    "purchase_cost"
    t.integer  "flight_activated"
    t.integer  "activity_category_id"
    t.string   "source_group_parent_id"
    t.string   "source_activity_category_id"
    t.integer  "parent_id"
    t.float    "cumulative_cost",                         default: 0.0,   null: false
    t.integer  "network_id"
    t.integer  "data_source_id",                          default: 1,     null: false
  end

  add_index "zones", ["data_source_id", "source_id", "network_id"], name: "index_zones_on_trinity", unique: true, using: :btree
  add_index "zones", ["site_id"], name: "fki_zones_site_id", using: :btree
  add_index "zones", ["z_site"], name: "index_zones_on_z_site", using: :btree

end
