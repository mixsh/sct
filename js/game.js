function GameModel() {
    /******************************* Game state *******************************/

    this.turnLength = ko.observable(10);
    this.currentTurn = ko.observable(1);

    this.initialConfig = {
        easy: {
            resources: {
                rations: 100,
                energy: 100,
                soma: 10,
                harvesters: 5,
            },
            compound: 200,
            population: 10,

            randomRobotDestructionRate: [0.05, 0.1],
            robotCompoundExtractionAmount: 50,

            reproductionRate: [0.1, 0.2],

            resourcePrice: {
                rations: 1,
                energy: 10,
                soma: 25,
                harvesters: 150,
            },

            resourceConsumptionRate: {
                rations: [1, 1.1],
                energy: [1, 1.1],
                soma: [0.1, 0.2],
            },

            deathsPerMissingResource: {
               rations: [1, 1],
               energy: [1, 1],
               soma: [0.1, 0.2],
            },
        }
    };

    this.shiftPressed = ko.observable(false);
    this.altPressed = ko.observable(false);


    /******************************* Population *******************************/

    // Current population
    this.population = ko.observable();

    // Reproduction rate
    this.reproductionRate = ko.observableArray();


    /******************************** Compound ********************************/

    this.storedCompound = ko.observable(0);
    this.turnCompound = ko.observable(0);

    /******************************* Harvesters *******************************/

    this.randomRobotDestructionRate = ko.observableArray();
    this.robotCompoundExtractionAmount = ko.observable();

    /******************************** Resources *******************************/

    this.resourcePrice = {
        rations: ko.observable(),
        energy: ko.observable(),
        soma: ko.observable(),
        harvesters: ko.observable(),
    };

    this.resourceConsumptionRate = {
        rations: ko.observableArray(),
        energy: ko.observableArray(),
        soma: ko.observableArray(),
    };

    this.deathsPerMissingResource = {
        rations: ko.observableArray(),
        energy: ko.observableArray(),
        soma: ko.observableArray(),
    };

    this.storedResources = {
        rations: ko.observable(),
        energy: ko.observable(),
        soma: ko.observable(),
        harvesters: ko.observable(),
    };

    this.currentTurnResources = {
        rations: ko.observable(0),
        energy: ko.observable(0),
        soma: ko.observable(0),
        harvesters: ko.observable(0),
    };

    this.nextTurnResources = {
        rations: ko.computed(function() {
            return this.storedResources.rations() +
                   this.currentTurnResources.rations();
        }, this),
        energy: ko.computed(function() {
            return this.storedResources.energy() +
                   this.currentTurnResources.energy();
        }, this),
        soma: ko.computed(function() {
            return this.storedResources.soma() +
                   this.currentTurnResources.soma();
        }, this),
        harvesters: ko.computed(function() {
            return this.storedResources.harvesters() +
                   this.currentTurnResources.harvesters();
        }, this),
    };

    this.resourcePriceMod = {
        // TODO - Refactor
        rations: ko.computed(function() {
            if (this.shiftPressed() && this.altPressed()) {
                return this.resourcePrice.rations() * 100;
            }
            else if (this.shiftPressed()) {
                return this.resourcePrice.rations() * 10;
            }
            else {
                return this.resourcePrice.rations();
            }

        }, this),
        energy: ko.computed(function() {
            if (this.shiftPressed() && this.altPressed()) {
                return this.resourcePrice.energy() * 100;
            }
            else if (this.shiftPressed()) {
                return this.resourcePrice.energy() * 10;
            }
            else {
                return this.resourcePrice.energy();
            }
        }, this),
        soma: ko.computed(function() {
            if (this.shiftPressed() && this.altPressed()) {
                return this.resourcePrice.soma() * 100;
            }
            else if (this.shiftPressed()) {
                return this.resourcePrice.soma() * 10;
            }
            else {
                return this.resourcePrice.soma();
            }
        }, this),
        harvesters: ko.computed(function() {
            if (this.shiftPressed() && this.altPressed()) {
                return this.resourcePrice.harvesters() * 100;
            }
            else if (this.shiftPressed()) {
                return this.resourcePrice.harvesters() * 10;
            }
            else {
                return this.resourcePrice.harvesters();
            }
        }, this),
    };

    this.cantAddMore = function(resource) {
        return this.turnCompound() < this.resourcePriceMod[resource]();
    };

    this.cantRemoveMore = function(resource) {
        // var amount = this.storedCompound() +
        //     this.resourcePriceMod[resource]();

        // return amount > this.storedCompound();

        // Testar se é menor do que zero, etc

        if (this.turnCompound() < this.storedCompound()) {
            var amount = this.resourcePriceMod[resource]() + this.turnCompound();
            return amount > this.storedCompound();
        }

        return true;
    };

    /*************************** Gameplay functions ***************************/

    this.start = function(difficulty) {
        // Apply initial resources depending on the game level
        var config = this.initialConfig[difficulty];

        this.storedResources.rations(config.resources.rations);
        this.storedResources.energy(config.resources.energy);
        this.storedResources.soma(config.resources.soma);
        this.storedResources.harvesters(config.resources.harvesters);

        this.storedCompound(config.compound);
        this.turnCompound(config.compound);

        this.population(config.population);

        this.randomRobotDestructionRate(config.randomRobotDestructionRate);
        this.robotCompoundExtractionAmount(config.robotCompoundExtractionAmount);

        this.reproductionRate(config.reproductionRate);

        this.resourcePrice.rations(config.resourcePrice.rations);
        this.resourcePrice.energy(config.resourcePrice.energy);
        this.resourcePrice.soma(config.resourcePrice.soma);
        this.resourcePrice.harvesters(config.resourcePrice.harvesters);

        this.resourceConsumptionRate.rations(config.resourceConsumptionRate.rations);
        this.resourceConsumptionRate.energy(config.resourceConsumptionRate.energy);
        this.resourceConsumptionRate.soma(config.resourceConsumptionRate.soma);

        this.deathsPerMissingResource.rations(config.deathsPerMissingResource.rations);
        this.deathsPerMissingResource.energy(config.deathsPerMissingResource.energy);
        this.deathsPerMissingResource.soma(config.deathsPerMissingResource.soma);

        this.currentTurn(1);
    };

    this.randomEffect = function(range, target) {
        var rate = getRandom(range[0], range[1]);
        return Math.floor(rate * target);
    };

    this.randomEffectOnPopulation = function(range) {
        return this.randomEffect(range, this.population());
    };

    this.addToPopulation = function(value) {
        this.population(this.population() + value);
        return this.population();
    };

    this.removeFromPopulation = function(value) {
        this.population(this.population() - value);

        if (this.population() < 0) {
            this.population(0);
        }

        return this.population();
    };

    this.calculateColonyConsumption = function() {
        var consumption = {};

        for(resource in this.resourceConsumptionRate) {
            var r = this.randomEffectOnPopulation(
                this.resourceConsumptionRate[resource]()
            );

            addToConsole(resource + ' consumption: ' + r);
            consumption[resource] = r;

            var resourceValue = this.storedResources[resource]() - r;
        }

        return consumption;
    };

    this.calculateMissingResourceDeaths = function(consumption) {
        // TODO - Refactor this function

        // ex: population = 500
        // missing energy for 200
        // 200 die
        // missing rations for 300
        // as 200 already died, only 100 more must die

        // Calculate missing resources
        var missing = {
            'rations': consumption.rations - this.storedResources.rations(),
            'energy': consumption.energy - this.storedResources.energy(),
            'soma': consumption.soma - this.storedResources.soma(),
        };

        for (resource in missing) {
            // If its negative, its not missing
            if (missing[resource] < 0) {
                missing[resource] = 0;
            }
        }

        console.log('missing', missing);

        var largestDeathCount = 0;

        // Calculate deaths per missing resource
        for (resource in this.deathsPerMissingResource) {
            var deaths = this.randomEffect(
                this.deathsPerMissingResource[resource](), missing[resource]);

            // Consider only the largest death count:
            // If 20 people die from lack of energy and 10 die from lack of
            // soma, the total death count is NOT 30, but 20 (people "would
            // have died" from lack of soma, but already died from the lack of
            // energy)
            if (deaths > largestDeathCount) {
                largestDeathCount = deaths;
            }
        }

        addToConsole('total deaths: ' + largestDeathCount);

        // Kill 'em!
        if (this.population() - largestDeathCount < 0) {
            this.population(0);
        }
        else {
            this.population(this.population() - largestDeathCount);
        }
    };

    this.updateResources = function(consumption) {
        for(resource in consumption) {
            var resourceValue =
                this.storedResources[resource]() - consumption[resource];

            // If there's something available, use it
            // If there's a lack of resources (negative), use zero
            this.storedResources[resource](
                resourceValue > 0 ? resourceValue : 0
            );
        }
    };

    this.calculatePopulationReproduction = function() {
        var newPeople = this.randomEffectOnPopulation(this.reproductionRate());
        this.population(this.population() + newPeople);
        addToConsole(newPeople + ' new people born (total ' + this.population() + ')');
    };

    this.calculateRandomRobotDestruction = function() {
        var destroyedHarvesters = this.randomEffect(
            this.randomRobotDestructionRate(),
            this.storedResources['harvesters']()
        );

        this.storedResources['harvesters'](
            this.storedResources['harvesters']() - destroyedHarvesters);

        addToConsole(destroyedHarvesters + ' destroyed harvesters');
    };

    this.calculateCompoundExtraction = function() {
        var compoundAmountExtracted =
            this.robotCompoundExtractionAmount() *
            this.storedResources['harvesters']();

        addToConsole('total compound extracted: ' + compoundAmountExtracted);

        this.storedCompound(
            this.storedCompound() + compoundAmountExtracted);
    };

    this.updateDataForNextTurn = function() {
        // Update turn counter
        this.currentTurn(this.currentTurn() + 1);

        // Update and clear current turn resources
        for (resource in this.currentTurnResources) {
            this.storedResources[resource](
                this.storedResources[resource]() +
                this.currentTurnResources[resource]()
            );

            this.currentTurnResources[resource](0);
        }

        // Update stored compound (it will usually be zero because
        // people tend to use the most possible resources, but some of it
        // may end being unused)
        this.storedCompound(this.turnCompound());
    };

    this.processNextTurn = function() {
        addToConsole('\n');
        addToConsole('**** TURN ' + this.currentTurn() + ' RESULTS ****');

        // Update data for coming turn
        this.updateDataForNextTurn();

        // harvesters get destroyed randomly
        this.calculateRandomRobotDestruction();

        // Remaining harvesters extract random compound
        this.calculateCompoundExtraction();

        // People consume resources
        var consumption = this.calculateColonyConsumption();

        // Not enough resources? People die
        this.calculateMissingResourceDeaths(consumption);

        if (this.population() == 0) {
            $('#modal-game-over').modal('show');
        }

        this.updateResources(consumption);

        // Remaining people reproduce
        this.calculatePopulationReproduction();

        // Set available compound to spend
        this.turnCompound(this.storedCompound());
    };

    this.addResource = function(type) {
        // TODO - Refactor

        var current = this.currentTurnResources[type]();

        var price;

        if (this.altPressed() && this.shiftPressed()) {
            price = this.resourcePrice[type]() * 100;
        }
        else if (this.shiftPressed()) {
            price = this.resourcePrice[type]() * 10;
        }
        else {
            price = this.resourcePrice[type]();
        }

        this.turnCompound(this.turnCompound() - price);

        if (this.altPressed() && this.shiftPressed()) {
            this.currentTurnResources[type](current + 100);
        }
        else if (this.shiftPressed()) {
            this.currentTurnResources[type](current + 10);
        }
        else {
            this.currentTurnResources[type](current + 1);
        }
    };

    this.removeResource = function(type) {
        // TODO - Refactor

        var current = this.currentTurnResources[type]();

        var price;

        if (this.altPressed() && this.shiftPressed()) {
            price = this.resourcePrice[type]() * 100;
        }
        else if (this.shiftPressed()) {
            price = this.resourcePrice[type]() * 10;
        }
        else {
            price = this.resourcePrice[type]();
        }

        this.turnCompound(this.turnCompound() + price);

        if (this.altPressed() && this.shiftPressed()) {
            this.currentTurnResources[type](current - 100);
        }
        else if (this.shiftPressed()) {
            this.currentTurnResources[type](current - 10);
        }
        else {
            this.currentTurnResources[type](current - 1);
        }
    };

    this.estimatedConsumption = {
        rations: ko.computed(function() {
            return this.randomEffectOnPopulation(
                this.resourceConsumptionRate.rations());
        }, this),
        energy: ko.computed(function() {
            return this.randomEffectOnPopulation(
                this.resourceConsumptionRate.energy());
        }, this),
        soma: ko.computed(function() {
            return this.randomEffectOnPopulation(
                this.resourceConsumptionRate.soma());
        }, this),
    };
}

/* Helper functions */

getRandom = function(min, max) {
    return Math.random() * (max - min) + min;
};

getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};

addToConsole = function(message) {
    $('.console').val($('.console').val() + '\n' + message);
    $('.console').scrollTop($('.console')[0].scrollHeight);
};

clearConsole = function() {
    $('.console').val('Welcome!\n');
}

drawBase = function() {
    var canvas = document.getElementById("base-canvas");
    var context = canvas.getContext("2d");

    // Rations
    context.beginPath();
    context.fillStyle = 'red';
    context.arc(170, 50, 50, 0, Math.PI * 2, false);
    context.fill()

    // Population
    context.beginPath();
    context.fillStyle = 'red';
    context.arc(170, 170, 50, 0, Math.PI * 2, false);
    context.fill()

    // Soma
    context.beginPath();
    context.fillStyle = 'red';
    context.arc(50, 170, 50, 0, Math.PI * 2, false);
    context.fill()

    // Energy
    context.beginPath();
    context.fillStyle = 'red';
    context.arc(170, 290, 50, 0, Math.PI * 2, false);
    context.fill()

    // Compound
    context.beginPath();
    context.fillStyle = 'red';
    context.arc(350, 170, 60, 0, Math.PI * 2, false);
    context.fill()

    // Harvesters
    context.beginPath();
    context.fillStyle = 'red';
    context.arc(440, 170, 50, 0, Math.PI * 2, false);
    context.fill()

    // Soma - Harvesters
    context.beginPath();
    context.strokeStyle = 'red';
    context.moveTo(50, 170);
    context.lineTo(300, 170);
    context.lineWidth = 5;
    context.stroke();

    // Soma - Energy
    context.beginPath();
    context.strokeStyle = 'red';
    context.moveTo(50, 170);
    context.lineTo(170, 290);
    context.lineWidth = 5;
    context.stroke();

    // Soma - Rations
    context.beginPath();
    context.strokeStyle = 'red';
    context.moveTo(50, 170);
    context.lineTo(170, 50);
    context.lineWidth = 5;
    context.stroke();

    // Rations - Energy
    context.beginPath();
    context.strokeStyle = 'red';
    context.moveTo(170, 50);
    context.lineTo(170, 290);
    context.lineWidth = 5;
    context.stroke();

    // Rations - Compound
    context.beginPath();
    context.strokeStyle = 'red';
    context.moveTo(170, 50);
    context.lineTo(350, 170);
    context.lineWidth = 5;
    context.stroke();

    // Energy - Compound
    context.beginPath();
    context.strokeStyle = 'red';
    context.moveTo(170, 290);
    context.lineTo(350, 170);
    context.lineWidth = 5;
    context.stroke();
}

/* jQuery + Knockout view stuff */

var gModel;

$(function() {
    drawBase();

    gModel = new GameModel();
    ko.applyBindings(gModel);
    gModel.start('easy');

    $('.btn-start-game').on('click', function() {
        // If a game over modal is opened, close it
        $('#modal-game-over').modal('hide');
        clearConsole();

        // Create new game
        gModel.start('easy');

        return false;
    });

    $('.btn-end-turn').on('click', function() {
        $('.audio-button-confirm')[0].play();
        gModel.processNextTurn();
        return false;
    });

    $('.btn-add-resource').on('click', function() {
        gModel.addResource($(this).data('type'));
        $('.audio-button-resource')[0].play();
        return false;
    });

    $('.btn-remove-resource').on('click', function() {
        gModel.removeResource($(this).data('type'));
        $('.audio-button-resource')[0].play();
        return false;
    });

    $(document).on('keydown', function() {
        gModel.shiftPressed(window.event.shiftKey ? true : false);
        gModel.altPressed(window.event.altKey ? true : false);
    });

    $(document).on('keyup', function() {
        gModel.shiftPressed(window.event.shiftKey ? true : false);
        gModel.altPressed(window.event.altKey ? true : false);
    });
});
