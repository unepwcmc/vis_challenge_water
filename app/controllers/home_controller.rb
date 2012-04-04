class HomeController < ApplicationController
  def index
  end
  
  def defaults
    render json: {
      '2012' => { # current year
        'groundwater_level' => 130_000_000_000,
        'water_consumption_per_year' => 2_600_000_000
      }
    }
  end
end
