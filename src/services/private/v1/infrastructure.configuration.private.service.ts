import {
    IInfrastructureConfiguration,
    InfrastructureConfiguration,
} from '../../../utils/types/infrastructureConfiguration';

/**
 * Get all the infrastructure configurations
 * @returns
 */
export const getInfrastructureConfigurationsService = async () => {
    return InfrastructureConfiguration.find().lean();
};

/**
 * Get a infrastructure configuration by id
 * @param infrastructureConfigurationId
 * @returns
 */
export const getInfrastructureConfigurationByIdService = async (
    infrastructureConfigurationId: string
) => {
    return InfrastructureConfiguration.findById(
        infrastructureConfigurationId
    ).lean();
};

/**
 * Create a infrastructure configuration
 * @param data
 * @returns
 */
export const createInfrastructureConfigurationService = async (
    data: IInfrastructureConfiguration
) => {
    const infrastructureConfiguration = new InfrastructureConfiguration(data);
    await infrastructureConfiguration.save();
    return infrastructureConfiguration;
};

/**
 * Update a infrastructure configuration
 * @param infrastructureConfigurationId
 * @param data
 * @returns
 */
export const updateInfrastructureConfigurationService = async (
    infrastructureConfigurationId: string,
    data: IInfrastructureConfiguration
) => {
    return InfrastructureConfiguration.findByIdAndUpdate(
        infrastructureConfigurationId,
        data,
        { new: true }
    );
};

/**
 * Delete a infrastructure configuration
 * @param infrastructureConfigurationId
 * @returns
 */
export const deleteInfrastructureConfigurationService = async (
    infrastructureConfigurationId: string
) => {
    return InfrastructureConfiguration.findByIdAndDelete(
        infrastructureConfigurationId
    ).lean();
};
