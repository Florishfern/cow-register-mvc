create database cow_register;

use cow_register;

create table farms(
    farm_id INT primary key,
    color ENUM('White','Brown','Pink') NULL,
    constraint check_farm_id check (farm_id between 1 and 9)
) ENGINE=InnoDB;

create table cows(
    cow_id CHAR(8) NOT NULL,
    color ENUM('White','Brown','Pink') NOT NULL,
    farm_id INT NOT NULL,
    age_years INT,
    age_months INT,
    mother_id CHAR(8),
    owner_firstName VARCHAR(8),
    owner_lastName VARCHAR(8),
    primary key(cow_id),
    foreign key(farm_id) references farms(farm_id),
    foreign key(mother_id) references cows(cow_id)
) ENGINE=InnoDB;
